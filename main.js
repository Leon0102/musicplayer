const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY ='Leon_Player';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const volume = $('#volume');
const cd  = $('.cd');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const volumeBtn = $('.btn-volume');

const playBtn = $('.btn-toggle-play');
const player = $('.player');

const playlist =$('.playlist')

const timer = $('.progress__current');
const songDuration = $('.progress__duration');


const app ={
    currentIndex:0,
    isPlaying:false,
    isRandom:false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
    {
      name: "Bật Nhạc Lên",
      singer: "HIEUTHUHAI FEAT. HARONIE",
      path: "./assets/mp3/batnhaclen-hieuthuhai.mp3",
      image: "https://i1.sndcdn.com/artworks-RIeWY8PZ8isQHTRM-WMoJWg-t500x500.jpg"
    },
    {
      name: "1800 -Love",
      singer: "GERNANG",
      path: "./assets/mp3/1-800-love.mp3",
      image:
        "https://images.genius.com/13f13edf1524ddeb4284b5d8a0e7dffe.1000x1000x1.jpg"
    },
    {
      name: "CUA",
      singer: "HIEUTHUHAI",
      path: "./assets/mp3/Cua-HIEUTHUHAIMANBO.mp3",
      image: "https://i1.sndcdn.com/artworks-xmkyz2yB9Nw1DinF-TbNyBQ-t500x500.jpg"
    },
    {
      name: "Laviai",
      singer: "HIEUTHUHAI KNG",
      path: "./assets/mp3/Laviai-HIEUTHUHAIKNG.mp3",
      image:
        "https://lh3.googleusercontent.com/proxy/sO3fSZXJoTFutW2agCMBdUWR1lJ7oASKt2HXLT8mEuAHPdplKjkhbHJuYTQBGK6l8hkqPUitfacSuiYCtjMNxH4B_Iq0hndViR0e"
    },
    {
      name: "MamaBoy",
      singer: "HIEUTHUHAI",
      path: "./assets/mp3/MamaBoyKingOfRap-HIEUTHUHAI.mp3",
      image:
        "https://scontent.fdad2-1.fna.fbcdn.net/v/t1.6435-9/120540833_1064235934057293_2588713025204275137_n.jpg?_nc_cat=107&ccb=1-5&_nc_sid=730e14&_nc_ohc=u__U4_khFxsAX9UJr_a&_nc_ht=scontent.fdad2-1.fna&oh=7efdb17bb9dd9c82f1d1474673fd9400&oe=616D2924"
    },
    {
      name: "Oish",
      singer: "HIEUTHUHAI",
      path:
        "./assets/mp3/Oish-HIEUTHUHAIthetumeymtu.mp3",
      image:
        "https://avatar-ex-swe.nixcdn.com/song/2020/07/29/5/7/4/a/1596008447789_640.jpg"
    },
    {
      name: "5050",
      singer: "HIEUTHUHAI",
      path: "./assets/mp3/5050.mp3",
      image:
        "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/9/7/0/2/9702062cdfc73808f28639e07f3e2874.jpg"
    }
    ],
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map((song,index) => {
            return ` 
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index= ${index}>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })  
    }, 
    handleEvent: function(){
        const cdWidth =cd.offsetWidth;
        
        // Xử lý CD rotate
        const cdThumbAnimate =cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],{
            duration:10000, //10 seconds
            iterations: Infinity,
        })
        cdThumbAnimate.pause();

        // Xử lý phóng to/ thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;

            cd.style.width = newWidth>0 ? newWidth + 'px': 0;
            cd.style.opacity = newWidth/ cdWidth;
        }
        // Xử lý khi click play
        playBtn.onclick = function(){
            if(app.isPlaying)
            {
                audio.pause();
            }
            else
            {
                audio.play();
            }
        }
        // Khi song được play
        audio.onplay = function(){
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // Khi song bị pause
        audio.onpause = function(){
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }   
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration)
            {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
            app.setTimer()
            app.displayDuration()
        }

        // Xử lý khi tua
        progress.oninput = function(e){
            // Convert từ % bài hát => giây
            const seekTme = audio.duration * e.target.value / 100;
            audio.currentTime = seekTme;
        }

        // Khi next song 
        nextBtn.onclick = function(){
            if(app.isRandom)
            {
                app.playRandomSong();
            }
            else{
                app.nextSong();
            }
            audio.play();
            app.scrollToActiveSong();
        }
        prevBtn.onclick = function(){
            if(app.isRandom)
            {
                app.playRandomSong();
            }
            else{
                app.prevSong();
            }
            audio.play();
            app.scrollToActiveSong();
        }

        // Xử lý random bật/ tắt random song
        randomBtn.onclick = function(e){          
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        }

        // Xử lý lặp lại một bài hát
        repeatBtn.onclick = function(e){ 
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle('active', app.isRepeat);
        }

        // Xử lý next song khi audio hết
        audio.onended = function(){
            if(app.isRepeat){
                audio.play();
            }
            else{
                nextBtn.click();
            }
        }

        // Lắng nghe click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active');
            // Xử lý khi click vào bài hát
            if( songNode || e.target.closest('.option'))
            {
                // Xử lý khi click vào bài hát
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                }
                // Xử lý khi click vào option
            }
        }
        // Xử lý volumeme
        volume.value=100;
        volume.oninput = function () {
            if(volume.value > 0)
            {
                audio.volume =volume.value /100;
                volume.innerHTML =`<style>.volume::before{ width:${volume.value}% }</style>`;
                $('.fa-volume-mute').classList.add('disabled');
                $('.fa-volume-up ').classList.remove('disabled');
            }
            else{
                audio.volume=0;
                volume.innerHTML =`<style>.volume::before{ width:0% }</style>`;
                $('.fa-volume-up').classList.add('disabled');
                $('.fa-volume-mute ').classList.remove('disabled');
            }
        };

    },
    getCurrentsong: function(){
        return this.songs[this.currentIndex];
    },
        // Timer
    setTimer: function () {
        setInterval(() => {
        var mins = Math.floor(audio.currentTime / 60)
        var secs = Math.floor(audio.currentTime % 60)
        if (secs < 10) {
            secs = '0' + String(secs)
        }
        if (mins < 10) {
            mins = '0' + String(mins)
        }
        timer.innerHTML = mins + ':' + secs
        }, 100)
    },
    // Display song's duration
    displayDuration: function () {
        if (audio.duration) {
        var mins = Math.floor(audio.duration / 60)
        var secs = Math.floor(audio.duration % 60)
        if (secs < 10) {
            secs = '0' + String(secs)
        }
        if (mins < 10) {
            mins = '0' + String(mins)
        }
        songDuration.innerHTML = mins + ':' + secs
        }
    },
    scrollToActiveSong: function(){
        setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block:'center',
            });
            // if (this.currentIndex <= 3) {
            //     $('.song.active').scrollIntoView({
            //     behavior: 'smooth',
            //     block: 'end',
            //     });
            // } else {
            //     $('.song.active').scrollIntoView({
            //     behavior: 'smooth',
            //     block: 'center',
            //     });
            // }
        },200)
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;


        // Không cần render lại cả web
        if ($('.song.active')) 
        {
        $('.song.active').classList.remove('active');
        }
        $$('.song')[app.currentIndex].classList.add('active')
        // console.log(heading,cdThumb,audio);
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length)
        {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex <0)
        {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function(){
        let newIndex = this.currentIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex == this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function(){
        // Gán cấu hình từ config
        this.loadConfig();
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // Lắng nghe/Xử lý các sự kiện (Dom events)
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vào UI
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button Repeat và Random
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);
    }
}

app.start();