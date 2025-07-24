import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { kodi, setKodiIp } from "../../../backend/kodiApi";
// ─── animations & neumorphic ───

const pulse = keyframes`
  0%   { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50%  { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
`;

const neumorphic = css`
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 12px;
  border: 2px solid #dee2e6;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1),
              0 2px 6px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
`;

// ─── styled ───

const IPRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
`;
const IPInput = styled.input`
  ${neumorphic}
  width: 140px;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  &:focus { outline: none; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
`;

const TrackpadContainer = styled.div`
  ${neumorphic}
  width: 100%; max-width: 400px; height: 300px;
  margin: 0 auto 1rem; touch-action: none;
  cursor: ${({ dragging }) => (dragging ? "grabbing" : "default")};
  overflow: hidden; position: relative;
  background: ${({ dragging }) =>
    dragging
      ? "linear-gradient(135deg,#f8f9fa 0%,#e9ecef 50%,#dee2e6 100%)"
      : "linear-gradient(135deg,#ffffff 0%,#f8f9fa 50%,#e9ecef 100%)"};
  box-shadow: ${({ dragging }) =>
    dragging
      ? "inset 0 2px 8px rgba(0,0,0,0.15),0 1px 3px rgba(0,0,0,0.1)"
      : "inset 0 1px 3px rgba(0,0,0,0.1),0 2px 6px rgba(0,0,0,0.05)"};
`;

const Surface = styled.div`
  position: absolute; width:100%; height:100%;
  background: radial-gradient(circle at 1px 1px,
    rgba(0,0,0,0.03) 1px, transparent 0);
  background-size:20px 20px; opacity:0.5;
`;
const Indicator = styled.div`
  position:absolute; width:60px; height:60px;
  transform:translate(-50%,-50%);
  left:${({x})=>x}%; top:${({y})=>y}%;
  background: radial-gradient(circle,
    rgba(0,123,255,0.2) 0%, rgba(0,123,255,0.1) 70%, transparent 100%);
  border:2px solid rgba(0,123,255,0.3); border-radius:50%;
  animation: ${pulse} 1s infinite; z-index:2;
`;
const IdleLabel = styled.div`
  position:absolute; inset:0;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  color:#666; pointer-events:none;
`;
const CornerDot = styled.div`
  position:absolute; width:4px; height:4px;
  background:rgba(0,0,0,0.1); border-radius:50%;
  ${({corner})=>corner==="tl"&&css`top:8px;left:8px;`}
  ${({corner})=>corner==="tr"&&css`top:8px;right:8px;`}
  ${({corner})=>corner==="bl"&&css`bottom:8px;left:8px;`}
  ${({corner})=>corner==="br"&&css`bottom:8px;right:8px;`}
`;

const ButtonsRow = styled.div`
  display:flex; justify-content:center; gap:16px; margin:1rem 0;
`;
const NeoButton = styled.button`
  ${neumorphic}
  width:60px; height:60px; padding:4px;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  cursor:pointer; background:linear-gradient(135deg,#fff 0%,#f0f0f0 100%);
  border:none; font-size:0.9rem;
  &:active {
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,0.15),
      inset -2px -2px 8px rgba(255,255,255,0.7);
  }
  i { font-size:1.2rem; margin-bottom:2px; }
`;
const VolumeWrapper = styled.div`
  display:flex; justify-content:center; align-items:center;
  gap:16px; margin-bottom:2rem;
`;
const VolumeRange = styled.input.attrs({type:"range"})`
  ${neumorphic}
  width:200px; height:12px; border-radius:6px; cursor:pointer;
  background:linear-gradient(135deg,#fff 0%,#f0f0f0 100%);
`;

// ─── component ───

const Control = () => {
  const storedIp = localStorage.getItem("kodiIp") || "";
  const [ip, setIp] = useState(storedIp);
  const [position, setPosition] = useState({ x:50, y:50 });
  const [isDragging, setIsDragging] = useState(false);

  const ctrl = useRef(null);
  const start = useRef({x:0,y:0});
  const t0 = useRef(0);

  useEffect(() => { if(ip) setKodiIp(ip); },[ip]);

  const getRel = (cx,cy) => {
    const r = ctrl.current.getBoundingClientRect();
    return {
      x: Math.max(0,Math.min(100,((cx-r.left)/r.width)*100)),
      y: Math.max(0,Math.min(100,((cy-r.top)/r.height)*100)),
    };
  };

  const onDown = (x,y) => {
    start.current={x,y};
    t0.current=Date.now();
    setIsDragging(true);
    setPosition(getRel(x,y));
  };
  const onMove = (x,y) => {
    if(!isDragging) return;
    setPosition(getRel(x,y));
  };
  const onUp = (x,y) => {
    if(!isDragging) return;
    const dt = Date.now()-t0.current;
    const dx = x - start.current.x, dy = y - start.current.y;
    const dist = Math.hypot(dx,dy);
    if(dist<5 && dt<200){
      kodi.select();
    } else if(dist>=5){
      if(Math.abs(dx)>Math.abs(dy)){
        dx>0 ? kodi.right() : kodi.left();
      } else {
        dy>0 ? kodi.down() : kodi.up();
      }
    }
    setIsDragging(false);
  };

  return (
    <>
      {/* IP entry */}
      <IPRow>
        <label htmlFor="kodi-ip">Kodi IP:</label>
        <IPInput
          id="kodi-ip"
          type="text"
          value={ip}
          placeholder="10.0.0.54"
          onChange={e=>setIp(e.target.value)}
        />
      </IPRow>

      {/* System buttons */}
      <ButtonsRow>
        <NeoButton onClick={kodi.shutdown}><i className="fas fa-power-off"/></NeoButton>
        <NeoButton onClick={kodi.quit}><i className="fas fa-sign-out-alt"/></NeoButton>
        <NeoButton onClick={kodi.reboot}><i className="fas fa-sync-alt"/></NeoButton>
      </ButtonsRow>

      {/* Trackpad */}
      <TrackpadContainer
        ref={ctrl}
        dragging={isDragging}
        onMouseDown={e=>onDown(e.clientX,e.clientY)}
        onMouseMove={e=>onMove(e.clientX,e.clientY)}
        onMouseUp={e=>onUp(e.clientX,e.clientY)}
        onMouseLeave={e=>onUp(e.clientX,e.clientY)}
        onTouchStart={e=>{e.preventDefault();const t=e.touches[0];onDown(t.clientX,t.clientY);}}
        onTouchMove={e=>{e.preventDefault();const t=e.touches[0];onMove(t.clientX,t.clientY);}}
        onTouchEnd={e=>{e.preventDefault();const t=e.changedTouches[0];onUp(t.clientX,t.clientY);}}
      >
        <Surface/>
        {isDragging && <Indicator x={position.x} y={position.y}/>}
        {!isDragging && (
          <IdleLabel>
            <i className="fas fa-hand-pointer fs-3 mb-2 opacity-50"/>
            <div>Trackpad</div>
            <div style={{opacity:0.75}}>Toca o desliza</div>
          </IdleLabel>
        )}
        {["tl","tr","bl","br"].map(c=><CornerDot key={c} corner={c}/>)}
      </TrackpadContainer>

      {/* Navigation */}
      <ButtonsRow>
        <NeoButton onClick={kodi.back}><i className="fas fa-arrow-left"/></NeoButton>
        <NeoButton onClick={kodi.home}><i className="fas fa-home"/></NeoButton>
        <NeoButton onClick={kodi.info}><i className="fas fa-info-circle"/></NeoButton>
      </ButtonsRow>

      {/* Playback */}
      <ButtonsRow>
        <NeoButton onClick={kodi.prev}><i className="fas fa-step-backward"/></NeoButton>
        <NeoButton onClick={kodi.playPause}><i className="fas fa-play"/></NeoButton>
        <NeoButton onClick={kodi.next}><i className="fas fa-step-forward"/></NeoButton>
      </ButtonsRow>

      {/* Volume (opcionales) */}
      <VolumeWrapper style={{ visibility:"hidden" }}>
        <VolumeRange/>
      </VolumeWrapper>
    </>
  );
};

export default Control;