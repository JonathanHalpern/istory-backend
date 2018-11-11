var http = require('http'),
    fileSystem = require('fs'),
    path = require('path');
    audioconcat = require('audioconcat');
    url = require('url');
    querystring = require('querystring');


const port = 3000;

var songs = [
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
}]

const buildStory = (story, name, gender) => (
    story.clips.map(clip => {
        switch(clip.type){
            case "main":
            return `${story.name}/${story.name}-${clip.number}.mp3`
            case "name":
            return `names/${name}/${name}-${clip.number}.mp3`
            case "pronoun":
            return `pronouns/${clip.specifier}/${gender}-${clip.number}.mp3`
        }
    })
)

const getMergedSong = (storyArray) => {
    console.log('start merge')
    var myPromise = new Promise(function(resolve, reject){
        audioconcat(storyArray.map(path => `${__dirname}/${path}`))
            .concat('temp.mp3')
            .on('start', function (command) {
                console.log('ffmpeg process started:', command)
            })
            .on('error', function (err, stdout, stderr) {
                console.error('Error:', err)
                console.error('ffmpeg stderr:', stderr)
            })
            .on('end', function (output) {
                console.error('Audio created in:', output)
                resolve(output)
                // return output;
            })
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
  console.log(storyArray)
  getMergedSong(storyArray).then(()=>{
      console.log('ready')

      var filePath = path.join(__dirname, 'temp.mp3');
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

}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})