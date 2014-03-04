(function(){

  'use strict';

  var songSelected = $('#audio-tag')[0];
  var timer;
  var songProgressTimer;

  $(document).ready(initialize);

  function initialize(){

    getMusic();
    $('#new-album').click(newAlbum);
    $('.play').on('click', play);
    $('.pause').click(pause);
    $('.stop').click(stop);
    $('#time-display').click(timeAdjust);

    clearInterval(timer);
    clearInterval(songProgressTimer);
  }

  function getMusic(){
    var url = 'albums/all';
    $.getJSON(url, receiveMusic);
    console.log('getMusic called: ');
  }

  function receiveMusic(data){
    console.log('receiveMusic called: ', data);
  }

  function newAlbum(){
    var url = '/albums/new';

    window.open(url);
    //console.log('newAlbum called: ');
  }

  function play(){
    var $playPause = $('#play-pause');
    if($playPause.hasClass('play')){
      $playPause
        .removeClass('play')
        .off('click', play)
        .addClass('pause')
        .on('click', pause)
        .text('Pause');
    }
    songSelected.play();
    clearInterval(timer);
    clearInterval(songProgressTimer);
    timer = setInterval(timerFunction, 1000);
    songProgressTimer = setInterval(timeProgressAnimation, getProgressInterval());
    $('#time-total').text(getDuration());
  }

  function pause(){
    var $playPause = $('#play-pause');
    if($playPause.hasClass('pause')){
      $playPause
        .removeClass('pause')
        .off('click', pause)
        .addClass('play')
        .on('click', play)
        .text('Play');
    }
    songSelected.pause();
    clearInterval(timer);
  }

  function stop(){
    var $playPause = $('#play-pause');
    var $timeProgress = $('#time-progress');

    songSelected.load();
    clearInterval(timer);
    clearInterval(songProgressTimer);
    timeProgressAnimation();
    resetTimeElapsed();
    $timeProgress.css('clip', 'rect(0px, 0px, 0px, 0px)');

    if($playPause.hasClass('pause')){
      $playPause
        .removeClass('pause')
        .off('click', pause)
        .addClass('play')
        .on('click', play)
        .text('Play');
    }
    console.log('stop called: ', songSelected.currentTime);
  }

  function timerFunction(){
    var playbackStyle = $('#playback-style').val();

    if(songSelected.ended){
      if(playbackStyle === 'loop-song'){
        //stop();
        play();
        console.log('loop the song');
      } else {
        stop(songSelected);
      }
      console.log('song ended');
    }
    $('#time-elapsed').text(getTimeElapsed(songSelected));

  }

  function timeProgressAnimation(){
    var duration = songSelected.duration;
    var currentTime = songSelected.currentTime;
    var timePercentage = currentTime / duration;
    var $timeProgress = $('#time-progress');
    var $timeBar = $('#time-bar');
    //var currentWidth = $timeProgress.css('width').split('p')[0] * 1;
    var totalWidth = $timeBar.css('width').split('p')[0] *1;
    var fillPercentage = totalWidth * timePercentage;
    //var currentHeight = $timeProgress.css('height').split('p')[0] * 1;
    var totalHeight = $timeBar.css('height').split('p')[0] *1;
    //var heightPercentage = totalHeight * timePercentage;
    var clipString = 'rect( 0px, '+ fillPercentage +'px, ' + totalHeight +'px, '+ '0px)';

    //$timeProgress.css('height', heightPercentage);
    $timeProgress.css('clip', clipString);

    //console.log('time animation thing: ', duration, currentTime, timePercentage, currentWidth, totalWidth, fillPercentage, $timeProgress.css('height'));
  }

  function getProgressInterval(){
    var duration = songSelected.duration;
    var timeBarWidth = $('#time-bar').css('width').split('p')[0] * 1;
    var interval = parseInt(timeBarWidth / duration);


    //console.log('get progress interval: ', duration, timeBarWidth, interval);
    return interval;
  }

  function getDuration(){
    var duration = songSelected.duration;
    var totalMinutes = Math.floor(duration / 60);
    var min = totalMinutes.toString();
    var totalSeconds = Math.floor(duration % 60);
    var sec = totalSeconds.toString();

    if(totalMinutes < 10){
      min = '0' + min;
    }
    if(totalSeconds < 10){
      sec = '0' + sec;
    }
    return (min + ':' + sec);
  }

  function getTimeElapsed(song){
    var currentTime = song.currentTime;
    var totalMinutes = Math.floor(currentTime / 60);
    var min = totalMinutes.toString();
    var totalSeconds = Math.floor(currentTime % 60);
    var sec = totalSeconds.toString();

    if(totalMinutes < 10){
      min = '0' + min;
    }
    if(totalSeconds < 10){
      sec = '0' + sec;
    }
    return (min + ':' + sec);
  }

  function resetTimeElapsed(){
    $('#time-elapsed').text('00:00');
  }

  function timeAdjust(){
    var $timeBar = $('#time-bar');
    var totalWidth = $timeBar.css('width').split('p')[0] *1;
    var position = event.offsetX;
    var percentage = position / totalWidth;
    var duration = songSelected.duration;
    var newTime = duration * percentage;

    songSelected.currentTime = newTime;
    timeProgressAnimation();

    console.log('adjustTime: ', totalWidth, position, percentage, duration, newTime);
  }

})();

