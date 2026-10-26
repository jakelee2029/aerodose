// Example routes shared by the flight-plan form and the route-comparison card.
export const PRESETS = [
  { label: 'JFK → LHR', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' }, dest: { iata:'LHR', name:'London Heathrow', city:'London, UK', lat:51.4775, lon:-0.4614, country:'UK' } },
  { label: 'LGA → SFO', origin: { iata:'LGA', name:'LaGuardia Airport', city:'New York, NY', lat:40.7769, lon:-73.8740, country:'USA' }, dest: { iata:'SFO', name:'San Francisco International', city:'San Francisco, CA', lat:37.6213, lon:-122.3790, country:'USA' } },
  { label: 'JFK → LAX', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' } },
  { label: 'LGA → SEA', origin: { iata:'LGA', name:'LaGuardia Airport', city:'New York, NY', lat:40.7769, lon:-73.8740, country:'USA' }, dest: { iata:'SEA', name:'Seattle-Tacoma International', city:'Seattle, WA', lat:47.4502, lon:-122.3088, country:'USA' } },
  { label: 'SYD → LAX', origin: { iata:'SYD', name:'Sydney Airport', city:'Sydney', lat:-33.9399, lon:151.1753, country:'Australia' }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' } },
  { label: 'DXB → JFK', origin: { iata:'DXB', name:'Dubai International', city:'Dubai', lat:25.2532, lon:55.3657, country:'UAE' }, dest: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' } },
];
