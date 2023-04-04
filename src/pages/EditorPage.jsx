/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import Loading from '../components/Loading';
import initSocket from '../socket';
import ACTIONS from '../Actions';

import {  Navigate, useLocation, useNavigate,useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';


const EditorPage = () => {
	
	const socketRef = useRef(null);
	const codeRef = useRef(null);
	const langRef = useRef(null);
	const inputRef = useRef(null);

	const location = useLocation();
	const {roomId} = useParams();
	const navigate = useNavigate();

	const [clients,setClients]=useState([]);
	const [inputActive,setInputActive] = useState(true);
	const [output,setOutput] = useState('Output goes here...');
	const [compiling,setIsCompiling] = useState(false);

	useEffect(()=>{
		const init = async ()=>{
			socketRef.current = await initSocket();

			socketRef.current.on('connect_error', (err)=> handleErrors(err));
			socketRef.current.on('connect_failed', (err)=> handleErrors(err));

			const handleErrors = (e)=>{
				console.log('socket error',e);
				toast.error('Socket connection failed, try again later.');
				navigate('/');
			}
			
			// Current user joining the socket
			socketRef.current.emit(ACTIONS.JOIN,{
				roomId,
				userName: location.state?.userName
			});

			// Listening for joined event
			socketRef.current.on(ACTIONS.JOINED,({clients, socketId,userName})=>{
				if(userName !== location.state?.userName){
					toast.success(`${userName} joined the room.`);
					console.log(`${userName} joined.`);
				}
				
				setClients(clients);
				socketRef.current.emit(ACTIONS.SYNC_CODE, {
					code: codeRef.current,
					socketId,
				});
			});

			// Listening for DISCONNECTED
			socketRef.current.on(ACTIONS.DISCONNECTED,({socketId,userName})=>{
				toast.success(`${userName} left the room.`);
				setClients(prev => {
					return prev.filter(client => client.socketId!==socketId);
				})
			});
		};
		init();

		return () => {
			socketRef.current.disconnect();
			socketRef.current.off(ACTIONS.JOINED);
			socketRef.current.off(ACTIONS.DISCONNECTED);
		};

	},[]);

	const copyRoomId = async ()=>{
		try{
			await navigator.clipboard.writeText(roomId);
			toast.success('RoomId copied to clipboard.')
		}
		catch(err){
			toast.error('Could not copy the roomId.')
		}
	};

	const leaveRoom = ()=>{
		navigate('/');
	}

	if(!location.state) {
		return <Navigate to='/'/>
	}

	const clientList=clients.map(client => {
		return <Client key={client.socketId} userName={client.userName}/>
	});

	const inputStyle={
		color: inputActive ? 'white':'transparent',
		background:  'transparent',
		border: 'none',
		pointerEvents: inputActive ? 'auto':'none'
	}
	const outputStyle={
		color: inputActive ? 'transparent':'white',
		background:  'transparent',
		pointerEvents: inputActive ? 'none':'auto'
	}


	// Code compilation 

	const submitCode = ()=>{

		if(!codeRef.current || codeRef.current==='') return;

		const encodedParams = new URLSearchParams();
		encodedParams.append("LanguageChoice", langRef.current.value);
		encodedParams.append("Program", codeRef.current);
		encodedParams.append("Input", inputRef.current.value);

		// console.log(inputRef.current);

		const options = {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'X-RapidAPI-Key': process.env.REACT_APP_API_KEY,
				'X-RapidAPI-Host': 'code-compiler.p.rapidapi.com'
			},
			body: encodedParams
		};

		setIsCompiling(true);
		setInputActive(false);

		fetch('https://code-compiler.p.rapidapi.com/v2', options)
			.then(response => response.json())
			.then(response => {
				if(response.Errors) setOutput(response.Errors || 'Something went wrong.');
				else setOutput(`${response.Result || ''}`);
				setIsCompiling(false);
			})
			.catch(err => console.error('err',err))
			.then();
	}

	return (
		<div className='mainWrapper' >
			<div className="aside">
				<div className="asideInner">
					<div className="logo">
						<img className='logoImg' src="/codelive-logo.png" alt="" />
					</div>
					<h3>Connected</h3>
					<div className="clientsList">
						{clientList}
					</div>
				</div>
				<button onClick={copyRoomId} className='btn copyBtn' >Copy Room Id</button>
				<button onClick={leaveRoom} className='btn leaveBtn' >Leave</button>
			</div>
			<div className="editorWapper">
				<Editor 
					socketRef={socketRef} 
					roomId={roomId} 
					onCodeChange={(code)=>{
						codeRef.current=code;
					}}
				/>
				<button 
					className='btn inputOutputBtn' 
					style={{background: inputActive ? 'transparent':'#282a36'}} 
					onClick={()=> setInputActive(true)}>
					Input
				</button>

				<button 
					className='btn inputOutputBtn' 
					style={{background: !inputActive ? 'transparent':'#282a36'}} 
					onClick={()=> setInputActive(false)}>
					Output
				</button>

				<div className="inputOutputWrapper">
					<textarea ref={inputRef} className='input' style={inputStyle} type="text" placeholder='Input goes here...' />
					<div style={outputStyle} className="output display-linebreak">
						{compiling ? <div className='loadingWrapper'><Loading/></div>:output}
					</div>
				</div>
			</div>

			<div className='langSelectAndRunWrapper'>
				<button onClick={submitCode}>Run code</button>
			
				<select className='langSelect' ref={langRef}>
					<option value="17">JavaScript</option>
					<option value="5">Python</option>
					<option value="6">C (gcc)</option>
					<option value="7">C++ (gcc)</option>
					<option value="1">C#</option>
					<option value="4">Java</option>
					<option value="46">Rust</option>
					<option value="20">Go</option>
					<option value="60">TypeScript</option>
					<option value="12">Ruby</option>
				</select>
			</div>	
			

		</div>
	)
}
export  default EditorPage;
