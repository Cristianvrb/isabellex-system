import { useState, useEffect } from 'react';
import { 
  Bot, 
  BarChart3, 
  Instagram, 
  Wallet,
  ImageIcon,
  Settings, 
  PlayCircle,
  Activity,
  Upload,
  Film,
  Zap,
  CheckCircle2,
  Clock,
  MessageCircle,
  Calendar,
  Camera,
  AlertCircle
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // ◈ SECURITY: MASTER LOCK ◈
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'criador';
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isabellex_auth') === 'true');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      localStorage.setItem('isabellex_auth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Acesso Negado. Tentativa computada.');
      setPassInput('');
    }
  };

  // URL da API — usa variável de ambiente em produção (Vercel), Render URL fixa para evitar crash
  const API_URL = import.meta.env.VITE_API_URL || 'https://isabellex-system.onrender.com';

  const [videoList, setVideoList] = useState<any[]>([]);
  const [postList, setPostList] = useState<any[]>([]);
  const [agendaList, setAgendaList] = useState<any[]>([]);
  const [stats, setStats] = useState({ acoes: 0, videos: 0, imagens: 0, custoIA: '0.00' });

  // ◈ DASHBOARD REAL ◈
  const [sistemaStatus, setSistemaStatus] = useState<any>({
    pausado: false, total: 0, publicados: 0, pendentes: 0, erros: 0, perdidos: 0, proximoPost: null
  });

  // ◈ MODAL CRIAR POST ◈
  const [showModal, setShowModal] = useState(false);
  const [novoPost, setNovoPost] = useState({ conteudo: '', tipo: 'threads', hora: '' });
  const [criandoPost, setCriandoPost] = useState(false);

  // ◈ KANBAN DE REELS ◈
  const [kanbanCards, setKanbanCards] = useState<any[]>([]);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [temaRoteiro, setTemaRoteiro] = useState('');
  const [cardExpandido, setCardExpandido] = useState<string | null>(null);

  const carregarKanban = async () => {
    try {
      const res = await fetch(`${API_URL}/api/kanban`);
      if (res.ok) setKanbanCards(await res.json());
    } catch(err) {}
  };

  const moverCard = async (id: string, novoStatus: string) => {
    await fetch(`${API_URL}/api/kanban/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });
    await carregarKanban();
  };

  const deletarCard = async (id: string) => {
    await fetch(`${API_URL}/api/kanban/${id}`, { method: 'DELETE' });
    await carregarKanban();
  };

  const gerarRoteiros = async () => {
    setKanbanLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reels/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: 5, tema: temaRoteiro })
      });
      if (res.ok) {
        setTemaRoteiro('');
        await carregarKanban();
      }
    } finally {
      setKanbanLoading(false);
    }
  };

  const carregarVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/videos`);
      if (res.ok) setVideoList(await res.json());
    } catch(err) {}
  };

  const carregarStats = async () => {
    try {
      const r = await fetch(`${API_URL}/api/stats`);
      if (r.ok) setStats(await r.json());
    } catch(e) {}
  };

  const carregarPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts`);
      if (res.ok) setPostList(await res.json());
    } catch(err) {}
  };

  const carregarAgenda = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agenda`);
      if (res.ok) setAgendaList(await res.json());
    } catch(err) {}
  };

  const carregarSistemaStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sistema/status`);
      if (res.ok) setSistemaStatus(await res.json());
    } catch(err) {}
  };

  const togglePausa = async () => {
    const endpoint = sistemaStatus.pausado ? '/api/sistema/retomar' : '/api/sistema/pausar';
    await fetch(`${API_URL}${endpoint}`, { method: 'POST' });
    await carregarSistemaStatus();
  };

  const criarPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setCriandoPost(true);
    try {
      const horaISO = novoPost.hora
        ? new Date(`${new Date().toISOString().split('T')[0]}T${novoPost.hora}:00`).toISOString()
        : new Date().toISOString();
      const res = await fetch(`${API_URL}/api/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: novoPost.conteudo, tipo: novoPost.tipo, scheduled_for: horaISO })
      });
      if (res.ok) {
        setShowModal(false);
        setNovoPost({ conteudo: '', tipo: 'threads', hora: '' });
        await carregarAgenda();
        await carregarSistemaStatus();
      }
    } finally {
      setCriandoPost(false);
    }
  };

  useEffect(() => {
    carregarStats();
    carregarVideos();
    carregarPosts();
    carregarAgenda();
    carregarSistemaStatus();

    // ◈ AUTO-REFRESH a cada 60s ◈
    const interval = setInterval(() => {
      carregarAgenda();
      carregarSistemaStatus();
    }, 60000);
    return () => clearInterval(interval);
  }, []);


  const fazerUploadVideo = async (e: any) => {
    if (!e.target.files[0]) return;
    const formData = new FormData();
    formData.append('video', e.target.files[0]);
    // Removi alert travado, usando logica visual limpa no log do console
    console.log('Enviando video para compressor...');
    try {
      await fetch(`${API_URL}/api/upload_video`, { method: 'POST', body: formData });
      carregarVideos();
      carregarStats();
    } catch(err) {
      console.error('Falha de envio', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container" style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', flexDirection: 'column'}}>
        <div style={{background: '#151515', padding: '40px', borderRadius: '12px', border: '1px solid #333', textAlign: 'center', width: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
          <Bot size={48} color="#bc1888" style={{marginBottom: '20px'}}/>
          <h2 style={{color: '#fff', marginBottom: '25px', fontFamily: 'inherit', letterSpacing: '2px'}}>isabellex.sys</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Master Password" 
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              style={{background: '#000', border: '1px solid #444', color: '#fff', padding: '12px', borderRadius: '6px', width: '100%', marginBottom: '15px', outline: 'none'}}
              autoFocus
            />
            <button type="submit" className="btn-primary" style={{width: '100%', padding: '12px'}}>Acessar Engine</button>
            {loginError && <p style={{color: '#ff4444', marginTop: '15px', fontSize: '13px'}}>{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* SIDEBAR LUXO */}
      <nav className="sidebar">
        <div className="brand">
          <div className="brand-title">
            isabellex.sys
            <div className="brand-dot"></div>
          </div>
          <span className="brand-subtitle">Automated Persona Engine</span>
        </div>

        <div className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={20} />
            <span>Finanças & Core</span>
          </div>
          <div className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => { setActiveTab('videos'); carregarVideos(); }}>
            <Film size={20} />
            <span>Studio de Reels</span>
          </div>
          <div className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => { setActiveTab('posts'); carregarPosts(); }}>
            <ImageIcon size={20} />
            <span>Posts de Imagem</span>
          </div>
          <div className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => { setActiveTab('agenda'); carregarAgenda(); }}>
            <Calendar size={20} />
            <span>Agenda Completa</span>
          </div>
          <div className={`nav-item ${activeTab === 'cerebro' ? 'active' : ''}`} onClick={() => setActiveTab('cerebro')}>
            <Bot size={20} />
            <span>Logs da OpenAI</span>
          </div>
          <div className={`nav-item ${activeTab === 'kanban' ? 'active' : ''}`} onClick={() => { setActiveTab('kanban'); carregarKanban(); }} style={{background: activeTab==='kanban' ? 'linear-gradient(135deg,rgba(62,139,255,0.15),rgba(188,24,136,0.15))':undefined}}>
            <Camera size={20} />
            <span>Roteiros IA</span>
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            <span>Configurações</span>
          </div>
        </div>


        <div className="sidebar-footer">
          <div className="system-status" style={{flexDirection:'column', alignItems:'flex-start', gap:'10px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div className="status-dot" style={{background: sistemaStatus.pausado ? '#ff4444' : undefined}}></div>
              {sistemaStatus.pausado ? 'SISTEMA PAUSADO' : 'SISTEMA OPERANTE'}
            </div>
            <button
              onClick={togglePausa}
              style={{background: sistemaStatus.pausado ? 'rgba(50,200,50,0.15)' : 'rgba(255,50,50,0.15)', border: `1px solid ${sistemaStatus.pausado ? '#32c832' : '#ff3232'}`, color: sistemaStatus.pausado ? '#32c832' : '#ff6666', borderRadius:'6px', padding:'6px 12px', cursor:'pointer', fontSize:'12px', width:'100%'}}
            >
              {sistemaStatus.pausado ? '▶ Retomar' : '⏸ Pausar Tudo'}
            </button>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <header className="topbar">
          <div className="greeting">
            <h2>{activeTab === 'dashboard' ? 'Métricas de Realidade' : activeTab === 'videos' ? 'Estúdio de Criação' : activeTab === 'posts' ? 'Posts Agendados' : activeTab === 'agenda' ? 'Agenda Completa — Timeline' : 'Acervo'}</h2>
            <p>{activeTab === 'dashboard' ? 'Números reais puxados direto do Supabase sem enrolação.' : activeTab === 'videos' ? 'Seus vídeos orgânicos. Minhas legendas ácidas.' : activeTab === 'posts' ? 'Fotos geradas pela IA. Preview e agendamento.' : activeTab === 'agenda' ? 'Todos os posts, stories e threads programados.' : ''}</p>
          </div>
          {activeTab === 'dashboard' && (
            <div className="actions">
              <button className="btn-secondary" onClick={() => { carregarStats(); carregarSistemaStatus(); }}>Refresh</button>
              <button className="btn-primary" style={{display: 'flex', gap: '8px', alignItems:'center'}} onClick={async (e) => {
                const btn = e.currentTarget; btn.innerText = '⏳...';
                await fetch(`${API_URL}/api/cron/trigger`);
                await carregarSistemaStatus(); await carregarAgenda();
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Forçar Loop';
              }}>
                <PlayCircle size={18} /> Forçar Loop
              </button>
            </div>
          )}
          {activeTab === 'videos' && (
            <label className="btn-primary" style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(188, 24, 136, 0.4)'}}>
              <Upload size={18} />
              Subir MP4 Cru
              <input type="file" accept="video/mp4" style={{ display: 'none' }} onChange={fazerUploadVideo} />
            </label>
          )}
          {activeTab === 'agenda' && (
            <div className="actions" style={{display: 'flex', gap: '10px'}}>
              <button className="btn-primary" onClick={() => setShowModal(true)} style={{display:'flex',gap:'6px',alignItems:'center',background:'linear-gradient(135deg,#3E8BFF,#bc1888)'}}>
                + Novo Post
              </button>
              <button className="btn-secondary" onClick={async (e) => {
                const btn = e.currentTarget;
                btn.innerText = '⏳ Gerando...';
                await fetch(`${API_URL}/api/gerar-semana`, { method: 'POST' });
                await carregarAgenda();
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg> Gerar Semana';
              }} style={{display: 'flex', gap: '8px', alignItems:'center'}}>
                <Bot size={18} /> Gerar Semana
              </button>
              <button className="btn-primary" onClick={async (e) => {
                const btn = e.currentTarget;
                btn.innerText = '⏳ Validando...';
                await fetch(`${API_URL}/api/validar-textos`, { method: 'POST' });
                await carregarAgenda();
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg> Validar Textos';
              }} style={{display: 'flex', gap: '8px', alignItems:'center'}}>
                <AlertCircle size={18} color="#fff" /> Validar Textos
              </button>
            </div>
          )}
        </header>

        {/* MODAL CRIAR POST */}
        {showModal && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#151515',border:'1px solid #333',borderRadius:'14px',padding:'32px',width:'480px',maxWidth:'90vw'}}>
              <h3 style={{color:'#fff',marginBottom:'20px',fontFamily:'inherit'}}>Novo Post Manual</h3>
              <form onSubmit={criarPost}>
                <textarea
                  placeholder="Texto do post... (máx 500 chars no Threads)"
                  value={novoPost.conteudo}
                  onChange={e => setNovoPost(p => ({...p, conteudo: e.target.value}))}
                  maxLength={500}
                  rows={6}
                  style={{width:'100%',background:'#000',border:'1px solid #444',color:'#fff',padding:'12px',borderRadius:'8px',resize:'vertical',fontFamily:'inherit',marginBottom:'12px'}}
                />
                <div style={{display:'flex',gap:'12px',marginBottom:'20px'}}>
                  <select value={novoPost.tipo} onChange={e => setNovoPost(p => ({...p, tipo: e.target.value}))} style={{flex:1,background:'#000',border:'1px solid #444',color:'#fff',padding:'10px',borderRadius:'8px'}}>
                    <option value="threads">Threads</option>
                    <option value="feed_foto">Feed (Foto)</option>
                    <option value="story_foto">Story</option>
                  </select>
                  <input type="time" value={novoPost.hora} onChange={e => setNovoPost(p => ({...p, hora: e.target.value}))} style={{flex:1,background:'#000',border:'1px solid #444',color:'#fff',padding:'10px',borderRadius:'8px'}} />
                </div>
                <div style={{display:'flex',gap:'12px'}}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{flex:1}}>Cancelar</button>
                  <button type="submit" className="btn-primary" style={{flex:1}} disabled={criandoPost}>{criandoPost ? '⏳ Salvando...' : '✓ Agendar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <section className="dashboard-grid">

            {/* STATUS REAL DO SISTEMA */}
            <div className="glass-panel stats-card" style={{gridColumn:'1/-1',display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'16px'}}>
              {[
                {label:'Publicados',val:sistemaStatus.publicados,color:'#32c832'},
                {label:'Pendentes',val:sistemaStatus.pendentes,color:'#3E8BFF'},
                {label:'Erros',val:sistemaStatus.erros,color:'#ff4444'},
                {label:'Perdidos',val:sistemaStatus.perdidos,color:'#888'},
                {label:'Total',val:sistemaStatus.total,color:'#bc1888'},
              ].map(({label,val,color}) => (
                <div key={label} style={{textAlign:'center'}}>
                  <div style={{fontSize:'32px',fontWeight:'700',color,fontFamily:'monospace'}}>{val}</div>
                  <div style={{color:'#888',fontSize:'12px',marginTop:'4px'}}>{label}</div>
                </div>
              ))}
            </div>

            {sistemaStatus.proximoPost && (
              <div className="glass-panel stats-card" style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:'16px',background:'linear-gradient(135deg,rgba(62,139,255,0.15),rgba(10,10,10,0.8))'}}>
                <Clock size={28} color="#3E8BFF"/>
                <div>
                  <div style={{color:'#888',fontSize:'12px',marginBottom:'4px'}}>PRÓXIMO POST</div>
                  <div style={{color:'#fff',fontWeight:'600'}}>{sistemaStatus.proximoPost.dia_semana?.toUpperCase()} {sistemaStatus.proximoPost.hora_formatada} — {sistemaStatus.proximoPost.tipo?.toUpperCase()}</div>
                  <div style={{color:'#aaa',fontSize:'13px',marginTop:'4px'}}>{sistemaStatus.proximoPost.conteudo?.substring(0,80)}...</div>
                </div>
              </div>
            )}

            <div className="glass-panel stats-card">
              <div className="stat-header">
                <span className="title-display">Gasto Operacional</span>
                <Wallet className="stat-icon" size={24} color="#FF4D4D" />
              </div>
              <div className="stat-value" style={{WebkitTextFillColor: 'initial', color: '#ff4d4d'}}>R$ {stats.custoIA}</div>
              <div className="stat-trend">
                <Zap size={16} color="#FF4D4D" />
                <span style={{color: '#ccc'}}>Convertido em USD ($5.80)</span>
              </div>
            </div>

            <div className="glass-panel stats-card">
              <div className="stat-header">
                <span className="title-display">Ações Cerebrais</span>
                <Activity className="stat-icon" size={24} color="#3E8BFF" />
              </div>
              <div className="stat-value" style={{WebkitTextFillColor: 'initial', color: '#3E8BFF'}}>{stats.acoes}</div>
              <div className="stat-trend">
                <Bot size={16} color="#3E8BFF" />
                <span style={{color: '#ccc'}}>Gerações Whisper/GPT/Ideogram</span>
              </div>
            </div>

            <div className="glass-panel stats-card" style={{background: 'linear-gradient(145deg, rgba(220, 39, 67, 0.2), rgba(10,10,10,0.8))'}}>
              <div className="stat-header">
                <span className="title-display" style={{color: '#fff'}}>Reels na Fila</span>
                <Instagram className="stat-icon" size={24} color="#f09433" />
              </div>
              <div className="stat-value" style={{WebkitTextFillColor: 'white'}}>{videoList.length}</div>
              <div className="stat-trend">
                <Film size={16} color="#fff" />
                <span style={{color: '#eee'}}>Hospedados no Supabase DB</span>
              </div>
            </div>

          </section>
        )}

        {/* REELS STUDIO - O PLAYER INSTAGRAMAVEL */}
        {activeTab === 'videos' && (
          <section className="reels-grid">
            {videoList.length === 0 ? (
              <div style={{ color: '#555', padding: '40px', fontFamily: 'var(--font-mono)' }}>O Estúdio está limpo. Arraste um arquivo .mp4 para o botão de Upload acima.</div>
            ) : videoList.map((vd, i) => (
              <div key={i} className="reels-card">
                
                {/* PLAYER DE VÍDEO REAL HTML5 (COM URL DO SUPABASE) */}
                <div className="reels-video-wrapper">
                  <video 
                    src={vd.urlMock} 
                    className="reels-video" 
                    controls 
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    preload="metadata"
                    playsInline
                  />
                </div>

                <div className="reels-info">
                  <div className={`reels-status ${vd.status === 'publicado' ? 'status-publicado' : 'status-pendente'}`} style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    {vd.status === 'publicado' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                    {vd.status === 'publicado' 
                      ? 'PUBLICADO' 
                      : (vd.scheduledFor 
                          ? `AGENDADO PARA ${new Date(vd.scheduledFor).toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}` 
                          : 'PENDENTE E INDEFINIDO')}
                  </div>
                  
                  {/* LEGENDA GERADA PELA IA */}
                  <div className="reels-caption">
                    {vd.legenda}
                  </div>
                  
                  {/* TRANSCRIÇÃO (O QUE VC DISSE) */}
                  <div className="reels-transcript">
                    <strong>Whisper captou:</strong> "{vd.transcription}"
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* POSTS DE IMAGEM - MESMO LAYOUT DOS REELS */}
        {activeTab === 'posts' && (
          <section className="reels-grid">
            {postList.length === 0 ? (
              <div style={{ color: '#555', padding: '40px', fontFamily: 'var(--font-mono)' }}>Nenhum post de imagem agendado ainda.</div>
            ) : postList.map((post, i) => (
              <div key={i} className="reels-card">
                
                {/* PREVIEW DA IMAGEM (COM URL DO SUPABASE) */}
                <div className="reels-video-wrapper">
                  <img 
                    src={post.urlMock} 
                    className="reels-video" 
                    alt="Post Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div className="reels-info">
                  <div className={`reels-status ${post.status === 'publicado' ? 'status-publicado' : 'status-pendente'}`} style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    {post.status === 'publicado' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                    {post.status === 'publicado' 
                      ? 'PUBLICADO' 
                      : (post.scheduledFor 
                          ? `AGENDADO PARA ${new Date(post.scheduledFor).toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}` 
                          : 'PENDENTE E INDEFINIDO')}
                  </div>
                  
                  {/* LEGENDA GERADA PELA IA */}
                  <div className="reels-caption">
                    {post.legenda}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* AGENDA COMPLETA — TIMELINE */}
      {activeTab === 'agenda' && (
        <main className="main-content" style={{paddingTop: '80px'}}>
          <div style={{ padding: '0 24px', maxWidth: '800px' }}>
            {/* Resumo */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <MessageCircle size={16} color="#8b5cf6" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ccc' }}>
                  Threads: {agendaList.filter(a => a.tipo === 'threads').length}
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Camera size={16} color="#f09433" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ccc' }}>
                  Feed: {agendaList.filter(a => a.tipo === 'feed_foto').length}
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Instagram size={16} color="#e1306c" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ccc' }}>
                  Stories: {agendaList.filter(a => a.tipo === 'story_foto').length}
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Film size={16} color="#ff4d4d" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ccc' }}>
                  Reels: {agendaList.filter(a => a.tipo === 'reels').length}
                </span>
              </div>
            </div>

            {/* Timeline */}
            {agendaList.map((item, i) => {
              const isThreads = item.tipo === 'threads';
              const isFeed = item.tipo === 'feed_foto';
              const isStory = item.tipo === 'story_foto';
              const isReels = item.tipo === 'reels';
              const iconColor = isThreads ? '#8b5cf6' : isFeed ? '#f09433' : isStory ? '#e1306c' : '#ff4d4d';
              const platformLabel = isThreads ? 'THREADS' : isFeed ? 'INSTAGRAM FEED' : isStory ? 'INSTAGRAM STORY' : 'REELS';
              const isPast = new Date(item.scheduledFor) < new Date();

              return (
                <div key={i} className="glass-panel" style={{
                  padding: '16px 20px',
                  marginBottom: '12px',
                  borderLeft: `3px solid ${iconColor}`,
                  opacity: isPast ? 0.5 : 1,
                  position: 'relative'
                }}>
                  {/* Header: horário + plataforma */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '1rem', 
                      fontWeight: 'bold',
                      color: iconColor,
                      minWidth: '50px'
                    }}>
                      {item.horaFormatada}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      letterSpacing: '2px',
                      color: iconColor,
                      background: `${iconColor}15`,
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {isThreads && <MessageCircle size={12} style={{verticalAlign: 'middle', marginRight: '4px'}} />}
                      {isFeed && <Camera size={12} style={{verticalAlign: 'middle', marginRight: '4px'}} />}
                      {isStory && <Instagram size={12} style={{verticalAlign: 'middle', marginRight: '4px'}} />}
                      {isReels && <Film size={12} style={{verticalAlign: 'middle', marginRight: '4px'}} />}
                      {platformLabel}
                    </span>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.65rem', 
                      color: '#555',
                      marginLeft: 'auto'
                    }}>
                      {item.diaSemana} {item.dataFormatada}
                    </span>
                    {isPast && <CheckCircle2 size={14} color="#10b981" />}
                    {!isPast && <Clock size={14} color="#f59e0b" />}
                  </div>

                  {/* Conteúdo */}
                  <div style={{
                    fontFamily: isThreads ? 'var(--font-display)' : 'var(--font-mono)',
                    fontSize: isThreads ? '0.9rem' : '0.78rem',
                    color: isThreads ? '#e2e8f0' : '#94a3b8',
                    lineHeight: '1.5',
                    fontStyle: (isStory || isReels) ? 'italic' : 'normal',
                    paddingLeft: '62px'
                  }}>
                    {/* Imagem preview se existir */}
                    {item.imagemUrl && (
                      <img 
                        src={item.imagemUrl} 
                        alt="Preview" 
                        style={{ 
                          width: isFeed ? '220px' : '120px', 
                          height: isFeed ? '275px' : '213px',
                          objectFit: 'cover', 
                          borderRadius: '8px', 
                          marginBottom: '10px',
                          display: 'block',
                          border: `1px solid ${iconColor}33`
                        }} 
                      />
                    )}
                    {isReels && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ff4d4d', fontWeight: 'bold', fontStyle: 'normal', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <AlertCircle size={14} /> TAREFA DO CRIADOR
                      </span>
                    )}
                    {isReels && <br/>}
                    {item.conteudo}
                  </div>

                  {/* Status */}
                  {item.status === 'aguardando_criador' && (
                    <div style={{ paddingLeft: '62px', marginTop: '8px' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontFamily: 'var(--font-mono)',
                        background: '#ff4d4d22',
                        color: '#ff4d4d',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>AGUARDANDO UPLOAD DO VÍDEO</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ◈ KANBAN DE REELS ◈ */}
      {activeTab === 'kanban' && (
        <main className="main-content">
          <header className="topbar">
            <div className="greeting">
              <h2>Roteiros de Reels — Kanban ◈</h2>
              <p>Isabellex gera os roteiros. O Criador grava. A máquina posta.</p>
            </div>
            <div className="actions" style={{display:'flex',gap:'10px',alignItems:'center'}}>
              <input
                type="text"
                placeholder="Tema (opcional)..."
                value={temaRoteiro}
                onChange={e => setTemaRoteiro(e.target.value)}
                onKeyDown={e => e.key==='Enter' && gerarRoteiros()}
                style={{background:'#111',border:'1px solid #333',color:'#fff',padding:'10px 14px',borderRadius:'8px',width:'200px',outline:'none'}}
              />
              <button className="btn-primary" onClick={gerarRoteiros} disabled={kanbanLoading} style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <Bot size={18}/> {kanbanLoading ? 'Gerando...' : 'Gerar Roteiros'}
              </button>
            </div>
          </header>

          {/* BOARD 4 COLUNAS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',padding:'24px',height:'calc(100vh - 100px)',overflowY:'auto'}}>
            {[
              {key:'ideia', label:'💡 Ideias',color:'#bc1888'},
              {key:'a_gravar', label:'🎬 A Gravar',color:'#f5a623'},
              {key:'gravado', label:'✅ Gravado',color:'#3E8BFF'},
              {key:'publicado', label:'🚀 Publicado',color:'#32c832'},
            ].map(col => {
              const cards = kanbanCards.filter(c => c.status === col.key);
              return (
                <div key={col.key} style={{background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:`1px solid ${col.color}33`,padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                    <span style={{fontWeight:'700',color:col.color,fontSize:'13px'}}>{col.label}</span>
                    <span style={{background:`${col.color}22`,color:col.color,borderRadius:'10px',padding:'2px 8px',fontSize:'11px'}}>{cards.length}</span>
                  </div>

                  {cards.map(card => (
                    <div key={card.id} style={{background:'#151515',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'14px',cursor:'pointer'}} onClick={() => setCardExpandido(cardExpandido===card.id ? null : card.id)}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                        <span style={{color:'#fff',fontWeight:'600',fontSize:'13px',lineHeight:'1.3',flex:1}}>{card.titulo}</span>
                        <button onClick={e => {e.stopPropagation(); deletarCard(card.id);}} style={{background:'none',border:'none',color:'#555',cursor:'pointer',padding:'0 0 0 8px',fontSize:'14px'}}>✕</button>
                      </div>

                      {card.gancho && (
                        <div style={{background:'rgba(188,24,136,0.1)',border:'1px solid rgba(188,24,136,0.3)',borderRadius:'6px',padding:'6px 10px',marginBottom:'8px',fontSize:'11px',color:'#e879b0'}}>🎯 {card.gancho}</div>
                      )}

                      {cardExpandido === card.id && (
                        <div style={{color:'#bbb',fontSize:'12px',lineHeight:'1.6',marginBottom:'10px',borderTop:'1px solid #222',paddingTop:'10px',whiteSpace:'pre-wrap'}}>{card.roteiro}</div>
                      )}

                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'8px'}}>
                        {col.key !== 'ideia' && <button onClick={e=>{e.stopPropagation();moverCard(card.id,'ideia');}} style={{fontSize:'10px',padding:'3px 8px',borderRadius:'4px',border:'1px solid #333',background:'none',color:'#888',cursor:'pointer'}}>← Ideia</button>}
                        {col.key !== 'a_gravar' && <button onClick={e=>{e.stopPropagation();moverCard(card.id,'a_gravar');}} style={{fontSize:'10px',padding:'3px 8px',borderRadius:'4px',border:'1px solid #f5a62355',background:'none',color:'#f5a623',cursor:'pointer'}}>🎬 Gravar</button>}
                        {col.key !== 'gravado' && <button onClick={e=>{e.stopPropagation();moverCard(card.id,'gravado');}} style={{fontSize:'10px',padding:'3px 8px',borderRadius:'4px',border:'1px solid #3E8BFF55',background:'none',color:'#3E8BFF',cursor:'pointer'}}>✅ Gravado</button>}
                        {col.key !== 'publicado' && <button onClick={e=>{e.stopPropagation();moverCard(card.id,'publicado');}} style={{fontSize:'10px',padding:'3px 8px',borderRadius:'4px',border:'1px solid #32c83255',background:'none',color:'#32c832',cursor:'pointer'}}>🚀 Publicado</button>}
                      </div>

                      <div style={{marginTop:'8px',fontSize:'10px',color:'#555'}}>{card.duracao_seg}s · {new Date(card.criado_em).toLocaleDateString('pt-BR')}</div>
                    </div>
                  ))}

                  {cards.length === 0 && (
                    <div style={{color:'#333',fontSize:'12px',textAlign:'center',padding:'20px 0',fontStyle:'italic'}}>Vazio ◈</div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
