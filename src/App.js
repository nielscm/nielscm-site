import { React, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import './App.css';

import mapGeoJson from './resources/geodata/farmers-markets-2012.json';

import Amplify from "aws-amplify";
import awsExports from "./aws-exports";
import GraphQLAPI, { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import * as queries from "./graphql/queries";

Amplify.configure(awsExports);

export default function App() {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/farmers-markets">
            <MarketLeafletMap />
          </Route>
          <Route path="/pdx-free-fridge">
            <FridgeLeafletMap />
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
          <li>
            <Link to="/pdx-free-fridge">PDX Free Fridge</Link>
            <p>PDX Free Fridge GeoJSON from AWS AppSync and MongDB Atlas displayed over Open Street Map</p>
          </li>
          <li>
            <Link to="/farmers-markets">Farmers Markets</Link>
            <p>2012 Farmers Market Locations as GeoJSON displayed over Open Street Map in a React-Leaflet application</p>
          </li>
        </ul>
      </nav>
    </div>
  );
}

/*******
 * 
 *  MARKETS DEMO
 * 
 */


function MarketPopupTemplate(props) {
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


function MarketLeafletMap() {
  const latlng = [45.520, -122.625];
  const zoom = 12;

  const [activeFeature, setActiveFeature] = useState(null);
  const [popupContent, setPopupContent] = useState('');
  const [features, setFeatures] = useState();

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
        <MarketPopupTemplate feature={activeFeature}/>
      </Popup>)
    } else {
      // console.log('or here')
      setPopupContent('')
    }
  }, [activeFeature]);

  return (<div>
      <MapContainer id='leaflet-map' center={latlng} zoom={zoom} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* { console.log(features )} */}
      {(mapGeoJson) ? mapGeoJson.features.map(f => (
        <Marker
          key={f.properties.id}
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
      )) : undefined }
      {popupContent}
    </MapContainer>
  </div>);
}

/*******
 * 
 *  FRIDGE DEMO
 * 
 */

function FridgePopupTemplate(props) {
  const f = props.feature;
  // console.log('props', props)
  return (<div className='fridge-popup'>
  <h3 className='fridge-popup--title'>{f.location_name}</h3>
  <p className='fridge-popup--desc'>{f.cross_streets}</p>
  <div className='fridge-popup--content'>
    <ul>
    {(() => {
        if (f.fridge === 'Yes') {
          const type = (f.fridge_type) ? f.fridge_type : '';
          // console.log('type', type, f)
          return (<li>{type} Fridge</li>)
        }
    })()}
    {(() => {
      if (f.pantry === 'Yes') {
        return (<li>Pantry</li>)
      }
    })()}
    {(() => {
      if (f.freezer === 'Yes') {
        return (<li>Freezer</li>)
      }
    })()}
    {(() => {
      if (f.additions && f.additions.length && f.additions.length > 0) {
        return (<li>{f.additions}</li>)
      }
    })()}
    </ul>
  </div>
</div>)
}

function FridgeLeafletMap() {
  const latlng = [45.520, -122.675];
  const zoom = 10;

  const [activeFeature, setActiveFeature] = useState(null);
  const [popupContent, setPopupContent] = useState('');
  const [features, setFeatures] = useState();

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
        <FridgePopupTemplate feature={activeFeature}/>
      </Popup>)
    } else {
      // console.log('or here')
      setPopupContent('')
    }
  }, [activeFeature]);

  useEffect(() => {
    // console.log('use effects')
    const fetchData = async () => {
      try {
        const response = await GraphQLAPI.graphql({
          query: queries.getLocations,
          authMode: GRAPHQL_AUTH_MODE.API_KEY
        })
        // console.log('response', response)
        const f = response.data.getLocations;
        // console.log(f)
        setFeatures(f)
      } catch (error) {
        console.error('error', error);
      }
    };

    fetchData();
  },[]);

  return (<div>
      <MapContainer id='leaflet-map' center={latlng} zoom={zoom} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* { console.log('features', features )} */}
      {(features) ? features.map( f => (
        <Marker
          key={f.id}
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
      )) : undefined }
      {popupContent}
    </MapContainer>
  </div>);
}