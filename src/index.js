import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ethers } from 'ethers'
import { Web3ReactProvider } from '@web3-react/core'
import Providers from './Providers'
import { disableReactDevTools } from '@fvilers/disable-react-devtools';


export const getLibrary = (provider): ethers.providers.Web3Provider => {
    const library = new ethers.providers.Web3Provider(provider)
    library.pollingInterval = 12000
    return library
}

// if (process.env.NODE_ENV === 'production') {
    disableReactDevTools();
// }

ReactDOM.render(
    <React.StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
            <Providers>
                <App />
            </Providers>
        </Web3ReactProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
