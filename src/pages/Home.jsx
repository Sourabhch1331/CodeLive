/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import {v4 as uuidv4} from 'uuid';
import toast from 'react-hot-toast';



const Home = () => {
    const navigate = useNavigate();


    const [roomId,setRoomId] = useState('');
    const [userName,setUserName] = useState('');


    const createNewRoom= (e)=>{
        e.preventDefault();
        const id = uuidv4();
        setRoomId(prev => id);
        toast.success('Created a new room')
    };

    const joinRoom = (e)=>{
        if(roomId==='' || userName===''){
            toast.error('Room Id and Username is required');
            return;
        }

        navigate(`/editor/${roomId}`,{
            state:{
                userName
            }
        });
    }

    const handleInputEnter =(e)=> {
        if(e.code!== 'Enter') return;
        joinRoom();
    }

    return (
    <div className='homePageWrapper'>
        <div className="formwrapper">
            <img className="homePageLogo" src="/codelive-logo.png" alt="CodeLive" />
            <h4 className="mainLable">Paste Invitation Room ID</h4>
            <div className="inputGroup">
                <input 
                    type="text" 
                    className='inputBox' 
                    placeholder='ROOM ID' 
                    onChange={(e)=> setRoomId(prev => e.target.value)}
                    value={roomId}
                    onKeyUp={handleInputEnter}
                />
                <input 
                    type="text" 
                    className='inputBox' 
                    placeholder='USERNAME' 
                    onChange={(e)=> setUserName(prev => e.target.value)}
                    value={userName}
                    onKeyUp={handleInputEnter}
                />
                <button onClick={joinRoom} className="btn joinBtn">Join</button>
                <span className="createInfo">
                    If you don't have an invite then create &nbsp;
                    <a onClick={createNewRoom} href="#" className="createNewBtn">New Room</a>
                </span>
            </div>
        </div>
        <footer>
            <h4>Built by <a href="https://github.com/Sourabhch1331" target="_blank">Sourabh Choudhary</a> 💚</h4>
        </footer>
    </div>
    )
}
export default  Home;
