var http = require('http'),
    fileSystem = require('fs'),
    path = require('path');
    url = require('url');
    querystring = require('querystring');
    ffmpeg = require('fluent-ffmpeg');


const port = 9000;

const songs = [
  'clip1.mp3',
  'clip2.mp3',
]

const stories = [{
    name: 'test-story',
    clips: [{
        type: 'name',
        number: 1
    }, {
        type: 'main',
        number: 1
    }]
},{
    name: 'wake-up',
    clips: [{
        type: 'name',
        number: 1
    }, {
        type: 'main',
        number: 1
    }, {
        type: 'pronoun',
        specifier: 'possesive',
        number: 1
    }, {
        type: 'main',
        number: 2
    }, {
        type: 'pronoun',
        specifier: 'possesive',
        number: 1
    }, {
        type: 'main',
        number: 3
    }, {
        type: 'name',
        number: 2
    }, 
    {
        type: 'name',
        number: 1
    }, {
        type: 'main',
        number: 4
    }, {
        type: 'pronoun',
        specifier: 'reflexive',
        number: 1
    }, {
        type: 'main',
        number: 5
    }, {
        type: 'pronoun',
        specifier: 'object',
        number: 1
    }, {
        type: 'main',
        number: 6
    }
]
}, {
    name: 'zoo',
    clips: [{
        type: 'name',
        number: 5
    }, {
        type: 'main',
        number: 1
    }, {
        type: 'name',
        number: 3
    }, {
        type: 'main',
        number: 2
    }, {
        type: 'name2',
        number: 1
    }, {
        type: 'main',
        number: 3
    }, {
        type: 'name',
        number: 3
    }, {
        type: 'main',
        number: 4
    }, {
        type: 'main',
        number: 5
    }, {
        type: 'main',
        number: 6
    }, {
        type: 'main',
        number: 7
    }, {
        type: 'main',
        number: 8
    }, {
        type: 'main',
        number: 9
    }, {
        type: 'main',
        number: 10
    }, {
        type: 'main',
        number: 11
    }
]
}]

const buildStory = (story, name, gender, name2 = 'gilly') => (
    story.clips.map(clip => {
        switch(clip.type){
            case "main":
            return `${story.name}/${story.name}-${clip.number}.mp3`
            case "name":
            return `names/${name}/${name}-${clip.number}.mp3`
            case "name2":
            return `names/${name2}/${name2}-${clip.number}.mp3`
            case "pronoun":
            return `pronouns/${clip.specifier}/${gender}-${clip.number}.mp3`
        }
    })
)

const getMergedSong = (storyArray) => {
    const outPath = 'temp.mp3'
    // const silence = ffmpeg().inputOptions('-r 24');
    // storyArray.map(path => `${__dirname}/${path}`).forEach(element => {
    //     const adjusted = ffmpeg(element)
    //         .complexFilter('volume=2')
    //         .save('temp-piece.mp3')
    //         .on('end', function() {
    //             console.log('piece made')
    //             combined.mergeAdd(`${__dirname}/temp-piece.mp3`);
    //         })
    // });

    var myPromise = new Promise(function(resolve, reject){
        let combined = ffmpeg();
        storyArray.map(path => `${__dirname}/${path}`).forEach(element => {
            const adjusted = ffmpeg(element).audioFrequency(22050);
            combined.mergeAdd(element);
            // combined.mergeAdd(silence);
        });
        combined.on('end', function() {
            console.log('files have been merged succesfully');
            resolve()
        })
            .on('error', function(err) {
            console.log('an error happened: ' + err.message);
        })
        .mergeToFile(outPath);
     })
     return myPromise
    
}

const requestHandler = (request, response) => {
    let parsedUrl = url.parse(request.url);  
    let params = querystring.parse(parsedUrl.query);
  console.log(request.url, params)
  const { name, storyId, gender } = params;
  const story = stories[storyId];
  const storyArray = buildStory(story, name, gender);
  getMergedSong(storyArray).then(()=>{
      console.log('ready')

      ffmpeg('temp.mp3')
        // .complexFilter('volume=2')
        // .complexFilter('aresample=10000')
        // .complexFilter('atempo=1.2')
        .complexFilter('adelay=1000|1000')
        // .complexFilter('vapad=pad_len=1024')
        
        // .complexFilter('asetnsamples=n=1234:p=0')
        
        // .audioFilters('volume=0.2')
        // .audioFilters('aevalsrc=0 -t 10')
        // .complexFilter([
        //     {
        //         "filter":"concat",
        //         "options": {
        //             "n": "2",
        //             "v":"0",
        //             "a":"1",
        //         },
        //         "input": "[0:a:0][1:a:0]"
        //     }
        // ])
        .save('temp2.mp3')
        .on('end', function() {
            console.log('file has been converted succesfully');

            var filePath = path.join(__dirname, 'temp2.mp3');
            var stat = fileSystem.statSync(filePath);
        
            console.log('listening')
        
            response.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': stat.size
            });
        
            var readStream = fileSystem.createReadStream(filePath);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(response);
          })
      

    //   var filePath = path.join(__dirname, 'temp.mp3');
    //   var stat = fileSystem.statSync(filePath);
  
    //   console.log('listening')
  
    //   response.writeHead(200, {
    //       'Content-Type': 'audio/mpeg',
    //       'Content-Length': stat.size
    //   });
  
    //   var readStream = fileSystem.createReadStream(filePath);
    //   // We replaced all the event handlers with a simple call to readStream.pipe()
    //   readStream.pipe(response);
  })

}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})