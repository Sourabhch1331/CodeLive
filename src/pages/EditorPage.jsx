/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import initSocket from '../socket';
import ACTIONS from '../Actions';

import {  Navigate, useLocation, useNavigate,useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';


const EditorPage = () => {
	
	const socketRef = useRef(null);
	const codeRef = useRef(null);

	const location = useLocation();
	const {roomId} = useParams();
	const navigate = useNavigate();

	const [clients,setClients]=useState([]);


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
				}else{
					toast.success(`Joined succesfully.`);
				}
				
				setClients(prevClients => clients);
				
				socketRef.current.emit(ACTIONS.SYNC_CODE,{
					code:codeRef.current,
					socketId
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
				<Editor socketRef={socketRef} roomId={roomId}/>
			</div>
		</div>
	)
}
export  default EditorPage;
