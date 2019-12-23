/*
 * @flow
 */
/* eslint-disable jsx-a11y/media-has-caption */

import React from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faHourglassHalf } from '@fortawesome/pro-solid-svg-icons';

import audioBufferToWav from '../utils/WavUtils';
import Logger from '../utils/Logger';
import StyledButton from './buttons/StyledButton';

const LOG :Logger = new Logger('AudioRecorderSagas');

/*
 * constants
 */

const MAX_LENGTH = 5;

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 200;

/*
 * styled components
 */

const OuterWrapper = styled.div`
  display: block;
  position: relative;
`;

const InnerWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const ButtonText = styled.span`
  margin-left: 5px;
`;

const Timer = styled.div`
  margin-top: 20px;
  font-size: 18px;
  padding: 5px 10px;
  display: inline-block;
  border-radius: 3px;
`;

const UnsupportedBrowserText = styled.div`
  color: #cc0000;
  font-size: 16px;
  font-weight: bold;
  margin: 30px 0;
`;

type Props = {
  onStart :() => void;
  onStop :() => void;
}

type State = {
  recording :boolean;
  chunks :Blob[];
  recordedAudio :Blob;
  timeRecorded :number;
  unsupportedBrowser :boolean;
}

class AudioRecorder extends React.Component<Props, State> {

  static defaultProps = {
    onStart: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      chunks: [],
      recordedAudio: null,
      timeRecorded: 0,
      unsupportedBrowser: false
    };
  }

  componentDidMount() {
    const { hasMedia } = this.state;
    const mediaSupport :boolean = !!(
      navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia
    );

    if (!mediaSupport) {
      // TODO: browser doesn't support navigator.getUserMedia interface
      return;
    }

    if (!hasMedia) {
      this.requestUserMedia();
    }
  }

  componentWillUnmount() {
    this.onStop();
    // turn off user media
    this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }

  requestUserMedia = () => {
    navigator.getUserMedia = (
      navigator.getUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia
      || navigator.webkitGetUserMedia
    );

    if (navigator.getUserMedia) {
      navigator.getUserMedia({
        audio: true,
        video: false
      }, (stream) => {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.onstop = this.onMediaStop;
        this.mediaRecorder.ondataavailable = this.onDataAvailable;
      }, (error) => {
        LOG.error(`An error occurred: ${error}`);
      });
    }
    else {
      this.setState({ unsupportedBrowser: true });
    }
  }

  onRecord = () => {
    const { onStart } = this.props;
    onStart();
    this.mediaRecorder.start();
    this.visualize(this.mediaRecorder.stream);
  }

  onStop = () => {
    this.cancelAnyAnimationFrame();
    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  onMediaStop = () => {
    const { onStop } = this.props;
    const { chunks, timeRecorded } = this.state;
    const blob = new Blob(chunks, { type: 'audio/wav' });
    if (timeRecorded >= 0) {

      let arrayBuffer;
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        arrayBuffer = event.target.result;
        this.audioCtx.decodeAudioData(arrayBuffer.slice(0), (originalAudioBuffer) => {
          const sampleRate = 16000;
          const numChannels = 1;
          const numFrames = originalAudioBuffer.duration * sampleRate;

          const o = new OfflineAudioContext(numChannels, numFrames, sampleRate);
          const source = o.createBufferSource();
          source.buffer = originalAudioBuffer;
          source.connect(o.destination);
          source.start(0);

          o.oncomplete = (audioBuffer) => {
            onStop(audioBufferToWav(audioBuffer.renderedBuffer));

            this.setState({
              recording: false,
              chunks: [],
              recordedAudio: blob
            });
          };
          o.startRendering();
        });
      };
      fileReader.readAsArrayBuffer(blob);
    }
  }

  onDataAvailable = (e) => {
    const { chunks } = this.state;
    chunks.push(e.data);
    this.setState({ chunks });
  }

  renderPlayAudio = () => {
    const { recording, recordedAudio } = this.state;
    if (recording || !recordedAudio) return null;
    const audioURL = window.URL.createObjectURL(recordedAudio);
    return (
      <article>
        <audio controls src={audioURL} />
      </article>
    );
  }

  setCanvasContext = (c) => {
    if (c !== null) {
      this.canvasCtx = c.getContext('2d');
    }
  }

  visualize = (stream) => {
    const source = this.audioCtx.createMediaStreamSource(stream);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    source.connect(this.analyser);

    this.draw();
  }

  requestAnyAnimationFrame = () => {
    const requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame;
    return requestAnimationFrame(this.draw);
  }

  cancelAnyAnimationFrame = () => {
    const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
      || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    cancelAnimationFrame(this.animationReq);
  }

  draw = () => {
    const {
      analyser, dataArray, bufferLength
    } = this;

    this.animationReq = this.requestAnyAnimationFrame();

    analyser.getByteTimeDomainData(dataArray);

    this.canvasCtx.fillStyle = '#fff';
    this.canvasCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = '#000';

    this.canvasCtx.beginPath();

    const sliceWidth = (CANVAS_WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i += 1) {
      const v = dataArray[i] / 128.0;
      const y = (v * CANVAS_HEIGHT) / 2;

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      }
      else {
        this.canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasCtx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    this.canvasCtx.stroke();

  }

  toggleRecord = () => {
    const { intervalFn, recording, timeRecorded } = this.state;
    if (recording) {
      clearInterval(intervalFn);
      this.setState({
        recording: false,
        intervalFn: null
      });
      this.onStop();
    }
    else {
      const nextIntervalFn = setInterval(() => {
        if (timeRecorded >= MAX_LENGTH) {
          this.toggleRecord();
        }
        else {
          this.setState({ timeRecorded: timeRecorded + 1 });
        }
      }, 1000);
      this.setState({
        timeRecorded: 0,
        recording: true,
        intervalFn: nextIntervalFn
      });
      this.onRecord();
    }
  }

  formatTime = (totalSeconds) => {
    const secondsRemaining = MAX_LENGTH - totalSeconds;
    const secondPrefix = secondsRemaining < 10 ? '0' : '';
    return `0:${secondPrefix}${secondsRemaining}`;
  }

  renderTimer = () => {
    const { recording, timeRecorded } = this.state;
    if (!recording) return null;
    const border = '2px solid black';

    const StyledTimer = styled(Timer)`
      color: black;
      border: ${border};
    `;

    const Icon = styled(FontAwesomeIcon).attrs({
      icon: faHourglassHalf
    })`
      margin-right: 7px;
    `;

    return (
      <StyledTimer>
        <Icon />
        {`${this.formatTime(timeRecorded)}`}
      </StyledTimer>
    );
  }

  renderContent() {
    const { recording, unsupportedBrowser } = this.state;
    if (unsupportedBrowser) {
      return (
        <UnsupportedBrowserText>
          Your browser does not support recording audio. Try opening in another browser.
        </UnsupportedBrowserText>
      );
    }
    const RecordIcon = styled(FontAwesomeIcon).attrs({
      icon: faCircle
    })`
      color: ${recording ? '#b80000' : 'black'}
    `;

    return (
      <section>
        <canvas
            style={{
              display: 'block',
              marginBottom: '0.5rem'
            }}
            height="200px"
            width="600px"
            ref={this.setCanvasContext} />
        <section>
          {this.renderPlayAudio()}
        </section>
        <div id="buttons">
          <StyledButton onClick={this.toggleRecord} type="button">
            <RecordIcon />
            <ButtonText>{recording ? 'Stop' : 'Record'}</ButtonText>
          </StyledButton>
          <br />
          {this.renderTimer()}
        </div>
      </section>
    );
  }

  render() {
    return (
      <OuterWrapper>
        <InnerWrapper>
          {this.renderContent()}
        </InnerWrapper>
      </OuterWrapper>
    );
  }
}

export default AudioRecorder;
