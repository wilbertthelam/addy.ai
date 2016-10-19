# addy.ai
League Pick'em and automated fantasy power rankings for ESPN fantasy football and baseball.

URL: <a href="http://www.addyai.me">http://www.addyai.me</a>

<b>Contributors:</b> David Lee, Addison Wright, Wilbert Lam<br>

<h2>Football features:</h2>
<ul>
  <li>Vote on any public ESPN league</li>
  <li>See past and current voting results</li>
  <li>Compare voting success against other users</li>
  <li>Live notifications for leagues that you've filled out</li>
</ul>

<h2>Tech stack:</h2>
<ul>
  <li>Node.JS (Express)</li>
  <li>ReactJS</li>
  <li>MySQL (AWS/Heroku)</li>
  <li>Python</li>
  <li>Webpack</li>
</ul>

<h2>Baseball Features:</h2>
<ul>
  <li>Custom news articles and publishing</li>
  <li>Weekly team stats</li>
  <li>Weekly top players stats per category</li>
  <li>Weekly MVP player</li>
  <li>Top team power rankings</li>
  <li>Weekly matchup scores (live)</li>
</ul>

<h2>Getting server running:</h2>
<ol>
  <li>Install nodemon globally using <code>npm install -g nodemon</code> (This will allow automatic server reboot on file save)</li>
  <li>Run <code>npm install</code> in root directory to install all modules</li>
  <li>Run <code>npm start</code> to launch Node.JS server</li>
</ol>

<h2>Setting up database:</h2>
<ol>
  <li>Using local MySQL instance, open and run <code>db_scripts/addyai_db.sql</code></li>
</ol>

<h2>Running web scrapers locally:</h2>
<ol>
  <li>Make sure Python 2.7x or higher is installed</li>
  <li>If needed, install PIP (https://pip.pypa.io/en/stable/installing/)</li>
  <li>Run <code>pip install requests</code> (may require sudo)</li>
  <li>Run <code>pip install beautifulsoup4</code> (may require sudo)</li>
  <li>Run <code>pip install lxml</code> (may require sudo)</li>
  <li>To run script, go to root and type <code>python scraper/scraper.py</code></li>
</ol>
