import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Control = ({ onBack }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const [raspberryIP, setRaspberryIP] = useState('192.168.1.100');
  const [port, setPort] = useState('5000');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isMouseOver, setIsMouseOver] = useState(false);
  const controlRef = useRef(null);
  
  // Efecto para manejar el movimiento del mouse/finger
  useEffect(() => {
    if (!controlRef.current) return;
    
    const element = controlRef.current;
    let animationFrameId;
    
    const handleMove = (clientX, clientY) => {
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      
      setPosition({ x, y });
      
      // Enviar posición al Raspberry Pi
      if (isConnected) {
        sendCommand(`MOVE:${x.toFixed(0)},${y.toFixed(0)}`);
      }
    };
    
    const handleMouseMove = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => handleMove(e.clientX, e.clientY));
    };
    
    const handleTouchMove = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => handleMove(e.touches[0].clientX, e.touches[0].clientY));
      e.preventDefault(); // Prevenir scroll
    };
    
    const handleMouseLeave = () => {
      setIsMouseOver(false);
      // Volver al centro suavemente
      const centerPosition = { x: 50, y: 50 };
      animateToPosition(centerPosition);
    };
    
    const handleMouseEnter = () => {
      setIsMouseOver(true);
    };
    
    // Animación suave para volver al centro
    const animateToPosition = (target) => {
      const start = { ...position };
      const duration = 300; // ms
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const newX = start.x + (target.x - start.x) * progress;
        const newY = start.y + (target.y - start.y) * progress;
        
        setPosition({ x: newX, y: newY });
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else if (isConnected) {
          // Enviar comando de posición central al finalizar la animación
          sendCommand('MOVE:50,50');
        }
      };
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Agregar event listeners
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      // Limpiar event listeners
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isConnected]);
  
  // Conectar al Raspberry Pi
  const connectToRaspberry = async () => {
    setConnectionStatus('Conectando...');
    try {
      // Simulamos una conexión exitosa
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsConnected(true);
      setConnectionStatus('Conectado');
    } catch (error) {
      console.error('Error de conexión:', error);
      setConnectionStatus('Error de conexión');
      setIsConnected(false);
    }
  };
  
  // Desconectar del Raspberry Pi
  const disconnectFromRaspberry = () => {
    setIsConnected(false);
    setConnectionStatus('Desconectado');
    // Volver al centro al desconectar
    setPosition({ x: 50, y: 50 });
  };
  
  // Enviar comando al Raspberry Pi
  const sendCommand = async (command) => {
    if (!isConnected) return;
    
    try {
      console.log(`Enviando comando: ${command}`);
      // EN LA IMPLEMENTACION SE DEBERIA CONECTAR AL RASPBERRY CON:
      // await axios.post(`http://${raspberryIP}:${port}/command`, { command });
    } catch (error) {
      console.error('Error al enviar comando:', error);
    }
  };
  
  // Renderizar botones de control
  const renderControlButton = (icon, command, label) => (
    <button 
      className="btn btn-outline-primary d-flex flex-column align-items-center p-2"
      onClick={() => sendCommand(command)}
      disabled={!isConnected}
    >
      <i className={`fas fa-${icon} fs-4 mb-1`}></i>
      <span className="small">{label}</span>
    </button>
  );
  
  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-4" onClick={onBack}>
        <i className="fas fa-arrow-left me-2"></i> Volver al historial
      </button>
      
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h2 className="h5 mb-0">Control Remoto</h2>
        </div>
        <div className="card-body">
          {/* Configuración de conexión */}
          <div className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className={`me-3 rounded-circle ${isConnected ? 'bg-success' : 'bg-danger'}`} 
                   style={{ width: '12px', height: '12px' }}></div>
              <span className="me-3">{connectionStatus}</span>
              
              {isConnected ? (
                <button className="btn btn-sm btn-danger" onClick={disconnectFromRaspberry}>
                  <i className="fas fa-plug me-1"></i> Desconectar
                </button>
              ) : (
                <button className="btn btn-sm btn-success" onClick={connectToRaspberry}>
                  <i className="fas fa-plug me-1"></i> Conectar
                </button>
              )}
            </div>
            
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">IP del Raspberry Pi</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={raspberryIP}
                  onChange={(e) => setRaspberryIP(e.target.value)}
                  disabled={isConnected}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Puerto</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  disabled={isConnected}
                />
              </div>
            </div>
          </div>
          
          {/* Área de control */}
          <div className="mb-4">
            <h3 className="h6 mb-3">Control de movimiento</h3>
            <div 
              ref={controlRef}
              className="position-relative bg-light rounded mx-auto"
              style={{ 
                width: '100%', 
                height: '300px',
                maxWidth: '400px',
                touchAction: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                background: 'linear-gradient(to right, #f0f0f0, #e0e0e0)',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
              }}
            >
              {/* Indicador de posición */}
              <div 
                className="position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  transform: 'translate(-50%, -50%)',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transition: 'left 0.1s linear, top 0.1s linear',
                  opacity: 0.8,
                  boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                  zIndex: 10
                }}
              >
                <div className="bg-white rounded-circle" style={{ width: '10px', height: '10px' }}></div>
              </div>
              
              {/* Líneas guía */}
              <div 
                className="position-absolute top-0 bottom-0" 
                style={{ 
                  left: '50%', 
                  width: '1px', 
                  background: 'rgba(0,0,0,0.1)', 
                  transform: 'translateX(-50%)' 
                }}
              ></div>
              <div 
                className="position-absolute left-0 right-0" 
                style={{ 
                  top: '50%', 
                  height: '1px', 
                  background: 'rgba(0,0,0,0.1)', 
                  transform: 'translateY(-50%)' 
                }}
              ></div>
              
              {/* Marcador central */}
              <div 
                className="position-absolute bg-white rounded-circle"
                style={{
                  width: '20px',
                  height: '20px',
                  transform: 'translate(-50%, -50%)',
                  left: '50%',
                  top: '50%',
                  boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                }}
              ></div>
            </div>
            <p className="text-center text-muted mt-2">
              {isMouseOver ? 
                `Posición: X:${position.x.toFixed(0)}%, Y:${position.y.toFixed(0)}%` : 
                'Mueve el cursor dentro del área para controlar'}
            </p>
          </div>
          
          {/* Botones de control */}
          {/* <div className="mt-4">
            <h3 className="h6 mb-3">Controles de reproducción</h3>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              {renderControlButton('step-backward', 'PREVIOUS', 'Anterior')}
              {renderControlButton('backward', 'REWIND', 'Retroceder')}
              {renderControlButton('play', 'PLAY', 'Reproducir')}
              {renderControlButton('pause', 'PAUSE', 'Pausa')}
              {renderControlButton('stop', 'STOP', 'Detener')}
              {renderControlButton('forward', 'FORWARD', 'Adelantar')}
              {renderControlButton('step-forward', 'NEXT', 'Siguiente')}
            </div>
          </div> */}
          
          {/* Botones adicionales */}
          {/* <div className="mt-4">
            <h3 className="h6 mb-3">Otras funciones</h3>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              {renderControlButton('home', 'HOME', 'Inicio')}
              {renderControlButton('arrow-up', 'UP', 'Arriba')}
              {renderControlButton('arrow-down', 'DOWN', 'Abajo')}
              {renderControlButton('arrow-left', 'LEFT', 'Izquierda')}
              {renderControlButton('arrow-right', 'RIGHT', 'Derecha')}
              {renderControlButton('undo', 'BACK', 'Atrás')}
              {renderControlButton('redo', 'FORWARD', 'Adelante')}
              {renderControlButton('info-circle', 'INFO', 'Información')}
              {renderControlButton('mouse-pointer', 'CLICK', 'Clic')}
            </div>
          </div> */}
        </div>
      </div>
      
      <div className="alert alert-info">
        <p className="mb-1"><strong>Instrucciones:</strong></p>
        <ul className="mb-0">
          <li>Ingresa la IP y puerto de tu Raspberry Pi</li>
          <li>Haz clic en "Conectar" para establecer la conexión</li>
          <li>Mueve el cursor dentro del área cuadrada para controlar el movimiento</li>
          <li>El cursor volverá al centro automáticamente cuando salgas del área</li>
          <li>Utiliza los botones para comandos específicos</li>
        </ul>
      </div>
    </div>
  );
};

export default Control;