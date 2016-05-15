/* Wilbert Lam
05/07/2016
graphs.js

Contains components for the graphs

*/

// var RBIGraph = React.createClass({
// 	loadFromServer: function() {
// 		$.ajax({
// 			url: this.props.url,
// 			dataType: 'json',
// 			cache: false,
// 			success: function(data) {
// 				console.log(data.data);
// 				this.setState({data: data.data});
// 			}.bind(this),
// 			error: function(xhr, status, err) {
// 				console.error(this.props.url, status, err.toString());
// 			}.bind(this)
// 		});
// 	},
// 	getInitialState: function() {
// 		return{ data: []};
// 	},
// 	componentDidMount: function() {
// 		this.loadFromServer();
// 		//setInterval(this.loadTeamsFromServer, this.props.pollInterval);
// 	},
// 	render: function() {
// 		return (
// 			<XYPlot
// 				width={300}
// 				height={300}>
// 				<HorizontalGridLines />
// 				<LineSeries
// 					data={[
// 						{x: 1, y: 10},
// 						{x: 2, y: 5},
// 						{x: 3, y: 15}
// 					]}/>
// 				<XAxis />
// 				<YAxis />
// 			</XYPlot>
// 		);
// 	}
// });

// ReactDOM.render(
// 	<RBIGraph/>,
// 	document.getElementById('rbiGraph'));
