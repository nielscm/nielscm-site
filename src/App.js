import { React, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { GeoJSON, MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import mapGeoJson from './resources/geodata/map.json';

import './App.css';

import { featureGroup, map } from "leaflet";

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/react-leaflet-map">React Leaflet Map</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/react-leaflet-map">
            <LeafletMap />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function LeafletMap() {
  const latlng = [45.520, -122.625];
  const zoom = 12;

  const [activeFeature, setActiveFeature] = useState(null);
  const [popupContent, setPopupContent] = useState('');

  useEffect(() => {
    // console.log('active', activeFeature)
    if (activeFeature && activeFeature.geometry) {
      // console.log('set here')
      setPopupContent(<Popup
        position={[
          activeFeature.geometry.coordinates[1],
          activeFeature.geometry.coordinates[0]
        ]}
        onClose={() => {
          setActiveFeature(null);
        }}
      >
        <div className='feature-popup'>
          <h3>Properties</h3>
          <table>
            <tbody>
            <tr><td>Fruit</td><td>{activeFeature.properties.fruit}</td></tr>
            <tr><td>Vegetable</td><td>{activeFeature.properties.vegetable}</td></tr>
            </tbody>
          </table>
        </div>
    </Popup>)
    } else {
      // console.log('or here')
      setPopupContent('')
    }
  }, [activeFeature]);

  // useEffect(() => {
  //   console.log(popupContent)
  // }, [popupContent]);

  return (<div>
      <MapContainer id='leaflet-map' center={latlng} zoom={zoom} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mapGeoJson.features.map(f => (
        <Marker
          key={f.properties.fruit}
          position={[
            f.geometry.coordinates[1],
            f.geometry.coordinates[0]
          ]}
          eventHandlers={{
            'click' : () => {
              setActiveFeature(f);
            }
          }}
        />
      ))}
      {popupContent}
    </MapContainer>
  </div>);
}