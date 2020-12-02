const { emit } = require('process');
var app = require('express')();
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 
//setting cors 
app.all('/*', function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
    next(); }); 
    
app.get('/', function(req, res) { 
    res.sendFile(__dirname + '/public/index.html');
}); 

// 접속자를 담아둘 배열
let client_list = [];
let get_ready_count = 0;
const class_names = ['카메라', '도넛', '의자', '빗자루', '선', '사과', '치아', '양말', '아이스크림', '꽃', '양초', '아령', '노트북', '컵', '구름', '쿠키', '벤치', '자전거', '번개', '버섯', '원', '고양이', '정지 표지판', '커피잔', '새', '텐트', '콘센트', '산', '막대사탕', '반바지', '나비', '나무', '열쇠', '주사기', '알람시계', '사다리', '드라이버', '식칼', '식탁', '실링팬', '소총', '바퀴', '눈', '다이빙 대', '모루', '얼굴', '테니스 채', '농구', '뱀', '비행기', '페도라 모자', '캐리어', '거미', '라디오', '야구공', '문', '도끼', '손목시계', '숟가락', '빵', '삽', '전구', '태양', '침대', '핸드폰', '연필', '검', '티셔츠', '바지', '신호등', '헬멧', '별', '자동차', '헤드폰', '달', '안경', '가위', '해머', '피자', '우산', '무지개', '톱', '수염', '핫도그', '웃는 얼굴', '시계', '클립', '선풍기', '야구방망이', '편지봉투', '책', '다리(건너는)', '마이크', '후라이펜', '베개', '수염', '정사각형', '드럼', '삼각형', '포도']

io.on('connection', (socket) => {
    get_ready_count = client_list.length+1;
    console.log("새로운 유저가 접속했습니다.");
    console.log("현재 인원: "+(client_list.length+1)+"명 입니다.");
    console.log(socket.id);
    // 룸 이름 설정
    socket.room = "chatroom";
    socket.on('systemIn', function(data) {
        //소켓에 정보를 추가한다.
        socket.userName = data.userName;
        // 소켓 접속 이력이 있는지 확인하기 위한 변수
        let wasEntered = false;

        const user = {
            socketId : socket.id,
            userName : socket.userName,
        }
        client_list.forEach(element => {
            if(element.socketId == user.socketId){
                wasEntered = true;
            }
        });
        // 접속한 이력이 없으면 참가
        if(!wasEntered){
            client_list.push(user);
            io.sockets.emit('client_conneted', [client_list, user]);
            // 현재 소켓을 Room에 참가 시킨다.
            socket.join(socket.room);
        }
    })

    // 현재 접속된 유저들 정보 불러오기
    socket.on('get_client_list', function() {
      socket.emit('get_client_list', client_list);  
    })

    socket.on('get_ready', function() {
      console.log(get_ready_count);
      if(get_ready_count-1 == -1)
        socket.emit('get_ready');
      else get_ready_count--;
    })
    // Game 시작
    socket.on('game_start', async function() {
      socket.emit('ready_count_down');
      await new Promise((resolve)=>{setTimeout(()=>{
        console.log('게임시작합니다.');
        resolve();
      }, 5000)});
      socket.emit('count_down', class_names[Math.floor(Math.random()*100)]);
      await new Promise((resolve)=>{setTimeout(()=>{
        console.log('10초 카운트 다운');
        resolve();
      }, 10000)});
      let userScore = new Array();
      socket.on('submit-canvas', function(data) {
        console.log(data)
        userScore.push(data);
      });
      await new Promise((resolve)=>{setTimeout(()=>{
        console.log('채점중입니다.');
        resolve();
      }, 5000)});
      userScore.sort((a,b)=>{return b.score - a.score});
      console.log(userScore);
      socket.emit('time_out', userScore[0]);
    })

    // 메세지 보내기
    socket.on('send_message', (msg) => {
        socket.broadcast.emit('send_message', msg);
        console.log(msg)
    });

    // 연결을 끊을 때
    socket.on('disconnect', () => {
        for (let idx = 0; idx < client_list.length; idx++) {
            if (client_list[idx].socketId == socket.id){
                console.log(client_list[idx].userName+'님이 퇴장하셨습니다.');
                socket.broadcast.emit('client_left', socket.id);
                client_list.splice(idx,1);
            }
        }
    });
});  

server.listen(3000, function() { 
    console.log('socket io server listening on port 3000') 
})