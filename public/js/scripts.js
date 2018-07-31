const socket = io();
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;

document.querySelector('button').addEventListener('click', () => {
  recognition.start();
});

recognition.addEventListener('result', e => {
  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  console.log('Confidence: ' + e.results[0][0].confidence);

  socket.emit('chat message', text);
});

io.on('connection', function(socket) {
  socket.on('chat message', text => {
    // get reply from dialogflow
    let dialogFlowReq = dialogFlow.textRequest(text, {
      sessionId: DF_SESSION_ID,
    });

    dialogFlowReq.on('response', response => {
      let dialogFlowText = response.result.fulfillment.speech;
      socket.emit('bot reply', dialogFlowText); // send result back to browser
    });

    dialogFlowReq.on('error', error => {
      console.log(error);
    });

    dialogFlowReq.end();
  });
});
