# addy.ai
Automated fantasy power rankings for ESPN fantasy sites

<b>Contributors:</b> David Lee, Linsen Wu, Addison Wright, Wilbert Lam<br>
<b>Goals:</b> Get version 1.0 running before basketball season is over.

<h2>Getting server running:</h2>
<ol>
  <li>Install nodemon globally using <code>npm install -g nodemon</code> (This will allow automatic server reboot on file save)</li>
  <li>Run <code>npm install</code> in root directory to install all modules</li>
  <li>Run <code>npm start</code> to launch Node.JS server</li>
</ol>

<h2>Running web scraper locally:</h2>
<ol>
  <li>Make sure Python 2.7x or higher is installed</li>
  <li>If needed, install PIP (https://pip.pypa.io/en/stable/installing/)</li>
  <li>Run <code>pip install requests</code> (may require sudo)</li>
  <li>Run <code>pip install beautifulsoup4</code> (may require sudo)</li>
  <li>Run <code>pip install lxml</code> (may require sudo)</li>
  <li>To run script, go to root and type <code>python scraper/scraper.py</code></li>
</ol>
