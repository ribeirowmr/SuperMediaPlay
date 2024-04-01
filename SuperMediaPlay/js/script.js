class AudioRecorder extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/style.css">
      <div id="audio-recorder">
        <button id="start-recording">Iniciar Gravação</button>
        <button id="stop-recording" disabled>Parar Gravação</button>
        <audio id="recorded-audio" controls></audio>
		<span id="recording-time">00:00</span>
      </div>
    `;
    this.startRecordingButton = this.shadowRoot.getElementById('start-recording');
    this.stopRecordingButton = this.shadowRoot.getElementById('stop-recording');
    this.recordedAudio = this.shadowRoot.getElementById('recorded-audio');
    this.mediaRecorder = null;
    this.chunks = [];
    this.blob = null;
	this.recordingTimeElement = this.shadowRoot.getElementById('recording-time');
    this.startTime = null;
    this.timerInterval = null;
	
  }

  connectedCallback() {
    this.startRecordingButton.addEventListener('click', () => this.startRecording());
    this.stopRecordingButton.addEventListener('click', () => this.stopRecording());
    this.initializeMediaRecorder();
  }

  disconnectedCallback() {
    this.startRecordingButton.removeEventListener('click', () => this.startRecording());
    this.stopRecordingButton.removeEventListener('click', () => this.stopRecording());
  }

  async initializeMediaRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);
      this.mediaRecorder.onstop = () => {
        this.blob = new Blob(this.chunks, { type: 'audio/mpeg' }); // Alterado para MP3
        this.recordedAudio.src = URL.createObjectURL(this.blob);
        this.startRecordingButton.disabled = false;
        this.stopRecordingButton.disabled = true;
        localStorage.setItem('audioRecording', URL.createObjectURL(this.blob));
      };
    } catch (error) {
      console.error('Error initializing MediaRecorder: ', error);
    }
  }

  startRecording() {
    this.chunks = [];
    this.blob = null;
    this.recordedAudio.src = '';
    this.mediaRecorder.start();
    this.startRecordingButton.disabled = true;
    this.stopRecordingButton.disabled = false;
	this.startTime = Date.now();
    this.updateRecordingTime();
    this.timerInterval = setInterval(() => this.updateRecordingTime(), 1000);
  }

  stopRecording() {
    this.mediaRecorder.stop();
	clearInterval(this.timerInterval);
    this.recordingTimeElement.textContent = '00:00'; // Reinicia o tempo quando a gravação para
  }
  
  updateRecordingTime() {
    const currentTime = new Date(Date.now() - this.startTime);
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    this.recordingTimeElement.textContent = `${minutes}:${seconds}`;
  }
}

customElements.define('audio-recorder', AudioRecorder);
