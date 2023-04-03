/* eslint-disable no-unused-vars */
import './App.css';
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {Toaster} from 'react-hot-toast';

function App() {
  return (
    <>
		<div>
			<Toaster 
				position='top-right'
				toastOptions={{
					success:{
						theme:{
							primary: '#4aed88'
						}
					}
				}}
			>
			</Toaster>
		</div>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Home/>}></Route>
				<Route path='/editor/:roomId' element={<EditorPage/>} />
				
			</Routes>
		</BrowserRouter>
	</>
  );
}

export default App;
