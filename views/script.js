let socket = io.connect('https://watchytwithme.herokuapp.com/')
let roomName = document.querySelector('.roomName').innerText

let urlForm = document.getElementById('urlForm')
let inputUrl = document.getElementById('urlInput')
urlForm.addEventListener('submit', (e) => {
    e.preventDefault()
    let url = inputUrl.value
    loadVideo(url, 0)
})

let chatForm = document.getElementById('chatForm')
let chatInput = document.getElementById('chatInput')
let usernameInput = document.getElementById('usernameInput')

let username, chatText
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    username = encodeHTML(usernameInput.value)
    if (username == '') {
        username = 'Unknown User'
    }
    chatText = encodeHTML(chatInput.value)
    chatInput.value = ''
    socket.emit('chat', {
        text: chatText,
        user: username,
        roomName
    })
    document.querySelector('.messageList').innerHTML += `<li class="collection-item"><div><b>${username}:</b> ${chatText}</a></div></li>`
    document.querySelector(".messageList").scrollTo(0, document.querySelector(".messageList").scrollHeight)
})

socket.on('chat', (data) => {
    if (roomName == data.roomName) {
        let {
            user
        } = data
        let {
            text
        } = data
        document.querySelector('.messageList').innerHTML += `<li class="collection-item"><div><b>${user}:</b> ${text}</a></div></li>`
        document.querySelector(".messageList").scrollTo(0, document.querySelector(".messageList").scrollHeight)
    }
})


let tag = document.createElement('script')

tag.src = 'https://www.youtube.com/iframe_api'
let firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

let player

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: (document.querySelector('.container').offsetWidth / 1.8),
        width: document.querySelector('.container').offsetWidth,
        videoId: 'hY7m5jjJ9mM',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    })
}

function onPlayerReady(event) {
    // event.target.playVideo()
}

function onPlayerStateChange(event) {
    console.log(event)
    if (event.data == YT.PlayerState.PLAYING) {
        console.log('emit playing and seconds', getSeconds())
        socket.emit('video', {
            id: getVideoId(),
            seconds: getSeconds(),
            status: 1,
            roomName
        })
    } else if (event.data == YT.PlayerState.PAUSED) {
        console.log('emit paused and seconds', getSeconds())
        socket.emit('video', {
            id: getVideoId(),
            seconds: getSeconds(),
            status: 2,
            roomName
        })
    }
}

socket.on('video', (data) => {
    if (roomName == data.roomName) {
        if (data.id == getVideoId()) {
            if (data.seconds > (getSeconds() + .5) || data.seconds < (getSeconds() - .5)) {
                seekTo(data.seconds)
            }
            if (data.status == 1) {
                playVideo()
            } else if (data.status == 2) {
                pauseVideo()
            }
        }
    }
})
socket.on('videoLoad', (data) => {
    if (roomName == data.roomName) {
        player.loadVideoById(data.id, 0, 'large')
    }
})


window.addEventListener('resize', () => {
    player.setSize(document.querySelector('.container').offsetWidth, (document.querySelector('.container').offsetWidth / 2))
})

let stopVideo = () => {
    player.stopVideo()
}
let pauseVideo = () => {
    player.pauseVideo()
}
let playVideo = () => {
    player.playVideo()
}
let getSeconds = () => {
    return player.getCurrentTime()
}
let seekTo = (sec) => {
    player.seekTo(sec, true)
}
let loadVideo = (url, sec) => {
    let id = url.substring((url.length - 11), url.length)
    player.loadVideoById(id, sec, 'large')
    socket.emit('videoLoad', {
        id: id,
        seconds: 0,
        status: 2,
        roomName
    })
}

let getVideoId = () => {
    let url = player.getVideoUrl()
    return url.substring((url.length - 11), url.length)
}

let encodeHTML = (s) => {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}