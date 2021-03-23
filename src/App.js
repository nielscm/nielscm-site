import { React, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { GeoJSON, MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import mapGeoJson from './resources/geodata/farmers-markets-2012.json';

import './App.css';

import { featureGroup, map } from "leaflet";

console.log(mapGeoJson)
export default function App() {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/farmers-markets">
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
  return (
    <div className='home'>
      <h2>Nielsen Demos</h2>
      <nav>
        <ul className='no-bullets'>
          {/* <li>
            <Link to="/">Demos Home</Link>
          </li> */}
          <li>
            <Link to="/farmers-markets">Farmers Markets</Link>
            <p>2012 Farmers Market Locations as GeoJSON displayed over Open Street Map in a React-Leaflet application</p>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function PopupTemplate(props) {
  const f = props.feature;
  return (<div className='feature-popup'>
  <h3>Farmers Market</h3>
  <table>
    <tbody>
    <tr><td>Name</td><td><a target="_blank" href={'https://' + f.properties.website}>{f.properties.marketnam}</a></td></tr>
    <tr><td>City</td><td>{f.properties.city}</td></tr>
    <tr><td>County</td><td>{f.properties.county}</td></tr>
    <tr><td>Location</td><td>{f.properties.location}</td></tr>
    <tr><td>Days</td><td>{f.properties.days}</td></tr>
    <tr><td>Hours</td><td>{f.properties.hours}</td></tr>
    <tr><td>Season</td><td>{f.properties.season}</td></tr>
    {(() => {
      if (f.properties.started) {
        return (<tr><td>Started</td><td>{f.properties.started}</td></tr>)
      }
    })()}
    </tbody>
  </table>
</div>)
}

function LeafletMap() {
  const latlng = [45.520, -122.625];
  const zoom = 12;

  const [activeFeature, setActiveFeature] = useState(null);
  const [popupContent, setPopupContent] = useState('');

  useEffect(() => {
    console.log('active', activeFeature)
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
        <PopupTemplate feature={activeFeature}/>
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