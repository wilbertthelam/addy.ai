<!doctype html>
	<head>
		<meta charset="utf-8">
		<title> Addi.ai Rankings Page </title>
		
		<style TYPE = "text/css">
			body{color: black;
			margin: 0 auto;
			border: 0;
			padding: 10px;
			font: 24px/24px Monaco, sans-serif;
			background-color: white;
			text-align: center;
			}
		</style>
	</head>

	<body>
		First attempt at Addi.ai's ranking system.
		Enter your name below to find out your ranking:
		<form method = "POST">
			<label for ="nameinput"> Name: </label>
			<input type = "text" name = "name" id = "nameinput" />
			<input type = "submit" value = "Enter" />
		</form>
		<?php
			$name = $_POST['name'];
			if($name == 'Linsen' || $name = 'linsen'){
				echo "You're last!";
			}
			else{
				echo "You're not last!";
			}
		?>
	</body>
</html>
