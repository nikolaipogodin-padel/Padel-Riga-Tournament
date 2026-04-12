
let user = JSON.parse(localStorage.getItem('user'));

if(!user){
  renderRegistration();
}else{
  renderDashboard();
}

function renderRegistration(){
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h2>Регистрация</h2>
      <input id="name" placeholder="Имя"><br><br>
      <input id="phone" placeholder="Телефон"><br><br>
      <input id="pass" type="password" placeholder="Пароль"><br><br>
      <input id="pass2" type="password" placeholder="Повтор"><br><br>
      <button onclick="register()">Создать</button>
    </div>
  `;
}

function register(){
  let name = document.getElementById('name').value;
  let phone = document.getElementById('phone').value;
  let pass = document.getElementById('pass').value;
  let pass2 = document.getElementById('pass2').value;

  if(!name || !phone || pass!==pass2){
    alert('Ошибка заполнения');
    return;
  }

  user = {name, phone, tournaments:[]};
  localStorage.setItem('user', JSON.stringify(user));
  renderDashboard();
}

let tournament = {
  id:1,
  name:"Morning Padel",
  totalTime:180,
  courts:2,
  players:10,
  max:16,
  buffer:5
};

function renderDashboard(){
  let status = tournament.players >= tournament.max ? "FULL" : "OPEN";

  document.getElementById('app').innerHTML = `
    <div class="card">
      <h2>${tournament.name}</h2>
      <p>Статус: ${status}</p>
      <p>${tournament.players}/${tournament.max}</p>
      <button onclick="join()">Войти</button>
    </div>
  `;
}

function join(){
  if(!user.tournaments.includes(tournament.id)){
    user.tournaments.push(tournament.id);
    tournament.players++;
    localStorage.setItem('user', JSON.stringify(user));
    renderDashboard();
  }
}
