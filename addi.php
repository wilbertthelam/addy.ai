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
			text-align: left;
			}
		</style>
	</head>

	<body>
		First attempt at Addi.ai's ranking system. <br>
		Enter your name below to find out your ranking: <br> <br>
		<form method = "POST">
			<label for ="nameinput"> Name: </label>
			<input type = "text" name = "name" id = "nameinput" />
			<input type = "submit" value = "Enter" />
		</form>
		<?php
			if(isset($_POST['name'])){
				$name = $_POST['name'];
				if($name == 'Linsen' || $name == 'linsen'){
					echo "You're last!";
				}
				else{
					echo "You're not last!";
				}
			}
		?>
	</body>
</html>
