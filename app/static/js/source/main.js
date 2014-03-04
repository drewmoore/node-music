(function(){

  'use strict';

  var albumsOnPage = [];
  var songSelected = $('#audio-tag')[0];
  var timer;
  var songProgressTimer;

  $(document).ready(initialize);

  function initialize(){

    getMusic();

    $('#edit-albums').click(editAlbums);
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
    //console.log('getMusic called: ', url);
  }

  function receiveMusic(data){
    albumsOnPage = data.albums;
    sortArtist();
    //console.log('receiveMusic called: ', data, albumsOnPage);
  }

  function sortArtist(){
    var songs = [];
    //_.each(_.sortBy(albumsOnPage, 'artist'), function(album){_.each(album.songs, function(song){_.sortBy(album.songs, song.songtags.v1.track);});});
    _.each(_.sortBy(albumsOnPage, 'artist'), function(album){
      _.each(album.songs, function(song){
        songs.push(song);
      });
    });

    fillTable(songs);
    //console.log('sortArtist called: ', songs);
  }

  function fillTable(songs){

    _.each(songs, function(song){
      if(!(!song.songfile)){
        var $tr = $('<tr>');
        var $th = $('#song-table > thead > tr > th');
        var $audio = $('<audio>');
        var $songList = $('#song-list');
        var backgroundUrl = 'url("' + findBackground(song) + '")';

        _.each($th, function(th){
          var $td = $('<td>');
          var $div = $('<div>');
          var trackNum = (song.songtags.v1.track || '');
          switch($(th).attr('class'))
          {
          case 'artist-column':
            $td.text(song.artist);
            break;
          case 'track-column':
            $td.text(trackNum);
            break;
          case 'title-column':
            $td.text(song.title);
            break;
          case 'album-column':
            $td.text(song.songtags.album || '');
            break;
          case 'cover-column':
            $div.css('background-image', backgroundUrl);
            $div.addClass('hide');
            $td.append($div);
            break;

          }
          $tr.append($td);
          //console.log('each th: ', $td, backgroundUrl);
        });

        $audio.attr('src', song.songfile);
        $tr.append($audio);
        $songList.append($tr);
        //console.log('each song: ', song, $tr, $th, $audio, $songList);
      }
      $('#song-list > tr').on('mouseover', mouseOver);
      $('#song-list > tr').on('mouseout', mouseOut);
      $('#song-list > tr').on('mousedown', mouseDown);
      $('#song-list > tr').on('mouseup', mouseUp);
      $('#song-list > tr').on('click', songClick);
    });
    //console.log('fillTable called: ', songs);
  }

  function mouseOver(){
    var $targetDiv = $(this).find('td > div');
    $targetDiv.removeClass('hide');
    $targetDiv.addClass('image-pop');
    $(this).addClass('highlighted');
    //console.log('mouseOver called: ', this, $targetDiv);
  }

  function mouseOut(){
    var $targetDiv = $(this).find('td > div');
    $targetDiv.removeClass('image-pop');
    $targetDiv.addClass('hide');
    $(this).removeClass('highlighted');
    //console.log('mouseOut called: ');
  }

  function mouseDown(){
    //$(this).removeClass('highlighted');
    $(this).addClass('getting-clicked');
    console.log('mouseDown called: ');
  }

  function mouseUp(){
    $(this).removeClass('getting-clicked');
    //$(this).addClass('highlighted');
    console.log('mouseUp called: ');
  }

  function songClick(event){
    var newAudio = $(this).find('audio')[0];

    songSelected = newAudio;
    event.preventDefault();
    //console.log('songClick called: ', this, newAudio);
  }

  function findBackground(song){
    var background;
    _.each(albumsOnPage, function(album){
      _.each(album.songs, function(albumSong){
        if(albumSong.songfile === song.songfile){
          background = album.cover;
        }
      });
    });
    //console.log('findBackground called: ', song, background);
    return background;
  }

  function editAlbums(){
    var url = '/albums';
    window.open(url);
    //console.log('editAlbums called: ');
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

    $('#time-elapsed').text(getTimeElapsed(songSelected));
    if(songSelected.ended){
      if(playbackStyle === 'loop-song'){
        //stop();
        play();
        console.log('loop the song');
      }
      if(playbackStyle === 'single-song'){
        stop(songSelected);
      }
      if(playbackStyle === 'continous'){
        findNextSong();
        play();
      }
      //console.log('song ended');
    }
  }

  function findNextSong(){
    var thisIndex = $('audio').index(songSelected);
    songSelected = $('audio')[thisIndex + 1];
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

