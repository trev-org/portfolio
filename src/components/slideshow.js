import { createContext, useContext, useEffect, useRef, useState } from 'react';

const SlideshowContext = createContext();

export function Slideshow({ children }) {
  const [context, setContext] = useState({
    items: [],
    edge: false
  });

  function nextSlide() {
    let i;
    for (i = 0; i <= 1; i++) {
      if (context.items.length > 1 && context.edge) {
        const head = context.items.shift();
        context.items.push(head);
      }
      context.edge = !context.edge;
      setContext({ ...context });
    } 
  }

  return (
    <>
    <SlideshowContext.Provider value={[context, setContext]}>
      <div
        id='slideshow'
        style={{
          height: '60%',
          width: '55%',
          position: 'relative',
          margin: '20px 20px 20px 2em',
          padding: '20px',
          float: 'right',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>
      { children.length > 1 ? <span class="material-symbols-rounded next-icon" onClick={nextSlide}>chevron_right</span> : <span></span>}
    </SlideshowContext.Provider>
    </>
  );
}

export function SlideshowItem({ children }) {
  const name = useRef(`${performance.now()}_${Math.random()}`);
  const [context] = useContext(SlideshowContext);
  const [stage, setStage] = useState('ready');

  useEffect(() => {
    context.items.push(name.current);
    return () => {
      const index = context.items.indexOf(name.current);
      context.items.splice(index, 1);
    };
  }, [context.items]);

  useEffect(() => {
    const activeName = context.items[0];
    if (activeName === name.current) {
      setStage('on');
    }
    if (activeName !== name.current && stage === 'on') {
      setStage('off');
    }
    if (activeName !== name.current && stage === 'off') {
      setStage('ready');
    }
  }, [context, stage]);

  let left = 0;
  let zIndex = 0;
  switch (stage) {
    case 'ready':
      left = '100%';
      break;
    case 'on':
      left = '0';
      zIndex = 1;
      break;
    case 'off':
      zIndex = 0;
      break;
    default:
  }

  return (
    <div
      style={{
        transition: '0.5s',
        position: 'absolute',
        left: left,
        zIndex: zIndex,
        width: '98%',
        height: '100%',
        WebkitAlignSelf: 'center',
        justifySelf: 'center',
        alignSelf: 'center',
      }}
    >
      {children}
    </div>
  );
}
