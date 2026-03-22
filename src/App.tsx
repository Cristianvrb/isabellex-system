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
  // URL da API — usa variável de ambiente em produção (Vercel), Render URL fixa para evitar crash
  const API_URL = import.meta.env.VITE_API_URL || 'https://isabellex-system.onrender.com';

  const [videoList, setVideoList] = useState<any[]>([]);
  const [postList, setPostList] = useState<any[]>([]);
  const [agendaList, setAgendaList] = useState<any[]>([]);
  // Fallback enquanto carrega os dados REAIS:
  const [stats, setStats] = useState({ acoes: 0, videos: 0, imagens: 0, custoIA: '0.00' }); 

  // Carrega vídeos REAIS armazenados
  const carregarVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/videos`);
      if (res.ok) setVideoList(await res.json());
    } catch(err) {} 
  };

  // Carrega finanças e metricas REAIS de gasto da IA
  const carregarStats = async () => {
    try {
      const r = await fetch(`${API_URL}/api/stats`);
      if (r.ok) {
        const s = await r.json();
        setStats(s);
      }
    } catch(e) {}
  };

  // Carrega posts de IMAGEM armazenados
  const carregarPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts`);
      if (res.ok) setPostList(await res.json());
    } catch(err) {} 
  };

  // Carrega AGENDA COMPLETA
  const carregarAgenda = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agenda`);
      if (res.ok) setAgendaList(await res.json());
    } catch(err) {} 
  };

  useEffect(() => {
    carregarStats();
    carregarVideos();
    carregarPosts();
    carregarAgenda();
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
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            <span>Configurações</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot"></div>
            SISTEMA OPERANTE
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
              <button className="btn-secondary" onClick={carregarStats}>Refresh Stats</button>
              <button className="btn-primary" style={{display: 'flex', gap: '8px', alignItems:'center'}}>
                <PlayCircle size={18} /> Forçar Loop Agora
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

        {activeTab === 'dashboard' && (
          <section className="dashboard-grid">
            
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
    </div>
  );
}

export default App;
