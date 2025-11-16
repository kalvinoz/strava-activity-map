import L from 'leaflet';
import { decodePolyline } from './utils/polyline.js';

// Initialize map
const map = L.map('map').setView([0, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map);

// State
let activities = [];
let polylines = [];

// Activity type colors
const ACTIVITY_COLORS = {
  'Run': '#fc4c02',
  'Ride': '#0066cc',
  'Swim': '#00cccc',
  'Walk': '#66cc00',
  'Hike': '#996600',
  'default': '#888888'
};

// DOM elements
const loadingEl = document.getElementById('loading');
const loadBtn = document.getElementById('load-btn');
const animateBtn = document.getElementById('animate-btn');
const activityTypeSelect = document.getElementById('activity-type');
const statCount = document.getElementById('stat-count');
const statDistance = document.getElementById('stat-distance');
const statTypes = document.getElementById('stat-types');

// Load activities from cache
async function loadActivities() {
  try {
    loadingEl.classList.remove('hidden');

    const response = await fetch('/data/activities/all_activities.json');
    if (!response.ok) {
      throw new Error('Failed to load activities. Please run: npm run fetch');
    }

    activities = await response.json();

    // Update stats
    updateStats();

    // Populate activity type filter
    populateActivityTypes();

    // Render activities
    renderActivities();

    loadingEl.classList.add('hidden');
    animateBtn.disabled = false;

  } catch (error) {
    loadingEl.classList.add('hidden');
    alert(`Error loading activities: ${error.message}\n\nPlease run: npm run fetch`);
  }
}

function updateStats() {
  const stats = activities.reduce((acc, activity) => {
    acc.types.add(activity.type);
    acc.totalDistance += activity.distance || 0;
    return acc;
  }, { types: new Set(), totalDistance: 0 });

  statCount.textContent = activities.length;
  statDistance.textContent = (stats.totalDistance / 1000).toFixed(2);
  statTypes.textContent = stats.types.size;
}

function populateActivityTypes() {
  const types = [...new Set(activities.map(a => a.type))].sort();

  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    activityTypeSelect.appendChild(option);
  });
}

function renderActivities() {
  // Clear existing polylines
  polylines.forEach(p => p.remove());
  polylines = [];

  // Filter activities
  const selectedType = activityTypeSelect.value;
  const filtered = selectedType === 'all'
    ? activities
    : activities.filter(a => a.type === selectedType);

  // Create bounds
  const bounds = [];

  // Render each activity
  filtered.forEach(activity => {
    const polylineStr = activity.map?.summary_polyline;
    if (!polylineStr) return;

    const coords = decodePolyline(polylineStr);
    if (coords.length === 0) return;

    const color = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;

    const polyline = L.polyline(coords, {
      color: color,
      weight: 2,
      opacity: 0.6
    }).addTo(map);

    // Add popup with activity info
    polyline.bindPopup(`
      <strong>${activity.name}</strong><br>
      Type: ${activity.type}<br>
      Distance: ${(activity.distance / 1000).toFixed(2)} km<br>
      Date: ${new Date(activity.start_date).toLocaleDateString()}
    `);

    polylines.push(polyline);
    bounds.push(...coords);
  });

  // Fit map to bounds
  if (bounds.length > 0) {
    map.fitBounds(bounds);
  }

  console.log(`Rendered ${polylines.length} activities`);
}

// Event listeners
loadBtn.addEventListener('click', loadActivities);
activityTypeSelect.addEventListener('change', renderActivities);

// Animation placeholder
animateBtn.addEventListener('click', () => {
  alert('Animation feature coming in Phase 4!');
});

// Initial load
loadingEl.classList.add('hidden');
