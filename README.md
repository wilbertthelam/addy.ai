# addy.ai
Automated fantasy power rankings for ESPN fantasy sites

URL (test version) : <a href="http://www.addyai.me">http://www.addyai.me</a>

<b>Contributors:</b> David Lee, Addison Wright, Wilbert Lam<br>

<h2>Features:</h2>
<ul>
  <li>Custom news articles and publishing</li>
  <li>Weekly team stats</li>
  <li>Weekly top players stats per category</li>
  <li>Weekly MVP player</li>
  <li>Top team power rankings</li>
  <li>Weekly matchup scores (live)</li>
</ul>

<h2>Planned features:</h2>
<ul>
  <li>No refresh updates (front end)</li>
  <li>Player profiles</li>
  <li>Weekly Team profiles</li>
  <li>Player images</li>
  <li>Trends</li>
  <li>Comments</li>
  <li>Player recommender</li>
  <li>Player comparator</li>
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
