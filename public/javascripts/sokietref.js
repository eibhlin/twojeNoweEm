var socket;
		socket = io.connect('http://localhost/');//http://cbping.azurewebsites.net/
		socket.on('ref', function (data) {
			console.log('xref')
			window.location.reload()
			})

		socket.on('log', function (data) {
			alert(data.output)
			})

