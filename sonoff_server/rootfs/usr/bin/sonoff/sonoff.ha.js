server.post('/savecnf', function(req, res) {
    var configDevices = JSON.parse(fs.readFileSync(devicesPath));
    console.log(serverIP)
    let cnf = req.body
    Object.keys(req.body).forEach(function(item) {
        console.log()
        if (cnf[item][0].type == "mqtt") {
            let url = "http://" + cnf[item][0].device + "/sv?w=5&r=1&p1=********&b1=on&a1=" + cnf[item][0].name + "&b2=0"
            axios.get(url)
                .then(function(response) {
                    console.log(response);
                })
                .catch(function(error) {
                    console.log(error);
                });

            url = "http://" + cnf[item][0].device + "/sv?w=2&r=1&mh=" + serverIP + "&ml=1883&mc=" + cnf[item][0].name + "_DVES_%2506X&mu=admin&mp=public&mt=" + cnf[item][0].uid + "&mf=%25topic%25%2F%25prefix%25%2F"
            axios.get(url)
                .then(function(response) {
                    console.log(response);
                })
                .catch(function(error) {
                    console.log(error);
                });


        }
        configDevices[item] = cnf[item]



    });
    //console.log(config)
    var body = '';

    fs.writeFile(devicesPath, JSON.stringify(configDevices), (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        //     console.log('Lyric saved!');
    });

    fs.writeFile(devicesPath, JSON.stringify(configDevices), (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        //     console.log('Lyric saved!');
    });
    // req.on('close', function (){
    //     //console.log("emd")
    //     fs.appendFile(filePath, body, function() {
    //         res.end();
    //     });
    // });
    //console.log(req.body); // your JSON

    res.send(req.body); // echo the result back
});