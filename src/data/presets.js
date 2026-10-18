// Example routes shared by the flight-plan form and the route-comparison card.
export const PRESETS = [
  { label: 'JFK → LHR', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' }, dest: { iata:'LHR', name:'London Heathrow', city:'London, UK', lat:51.4775, lon:-0.4614, country:'UK' } },
  { label: 'LAX → NRT', origin: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' }, dest: { iata:'NRT', name:'Narita International', city:'Tokyo', lat:35.7720, lon:140.3929, country:'Japan' } },
  { label: 'JFK → LAX', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' } },
  { label: 'ANC → FRA', origin: { iata:'ANC', name:'Ted Stevens Anchorage International', city:'Anchorage, AK', lat:61.1743, lon:-149.9963, country:'USA' }, dest: { iata:'FRA', name:'Frankfurt Airport', city:'Frankfurt', lat:50.0379, lon:8.5622, country:'Germany' } },
  { label: 'SYD → LAX', origin: { iata:'SYD', name:'Sydney Airport', city:'Sydney', lat:-33.9399, lon:151.1753, country:'Australia' }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' } },
  { label: 'DXB → JFK', origin: { iata:'DXB', name:'Dubai International', city:'Dubai', lat:25.2532, lon:55.3657, country:'UAE' }, dest: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' } },
];
