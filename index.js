var http = require('http'),
    fileSystem = require('fs'),
    path = require('path'),
    url = require('url'),
    querystring = require('querystring'),
    ffmpeg = require('fluent-ffmpeg'),
    rimraf = require('rimraf');

const stories = require('./stories');
const port = 9000;

const buildStory = (story, name, gender, npcArray) => (
    story.clips.map(clip => {
        let relativePath = '';
        switch(clip.type){
            case "main":
            relativePath = `stories/${story.name}/${story.name}-${clip.number}.mp3`
            break;
            case "name":
            relativePath = `names/${name}/${name}-${clip.number}.mp3`
            break;
            case "npc":
            relativePath = `names/${npcArray[clip.npcNumber]}/${npcArray[clip.npcNumber]}-${clip.number}.mp3`
            break;
            case "pronoun":
            relativePath = `pronouns/${clip.specifier}/${gender}-${clip.number}.mp3`
            break;
        }
        const path = `${__dirname}/audioFiles/${relativePath}`
        return {
            ...clip,
            path
        }
    })
)

const applyFilters = (clip, index) => (
    new Promise((resolve)=> {
        const { adelay=0, volume=1 } = clip;
        ffmpeg(clip.path).complexFilter(`adelay=${adelay}|${adelay},volume=${volume}`)
            .saveToFile(`_tmp/pieces/${index}.mp3`)
            .on('end', function() {
                resolve();
            })
    })
)

const getMergedSong = (storyArray) => {
    const outPath = '_tmp/main.mp3'
    return Promise.all(storyArray.map((clip, index) =>
        applyFilters(clip, index)
    )).then(()=>(
        new Promise(function(resolve, reject){
            let combined = ffmpeg();
            for(let i = 0; i < storyArray.length; i++) {
                let element = `${__dirname}/_tmp/pieces/${i}.mp3`
                combined.mergeAdd(element);
            }
            combined.on('end', function() {
                console.log('files have been merged succesfully');
                rimraf(`${__dirname}/_tmp/pieces/*`, function () { console.log('done'); });
                resolve()
            })
                .on('error', function(err) {
                console.log('an error happened: ' + err.message);
            })
            .mergeToFile(outPath);
         })
    ))
    
}

const requestHandler = (request, response) => {
    let parsedUrl = url.parse(request.url);  
    let params = querystring.parse(parsedUrl.query);
    console.log(params)
    const { name, storyId, gender, npcs } = params;
    const npcArray = npcs.split(',');
    console.log(npcArray)
    const story = stories[storyId];
    const storyArray = buildStory(story, name, gender, npcArray);
    getMergedSong(storyArray).then(()=>{

        const filePath = path.join(__dirname, '_tmp/main.mp3');
        const stat = fileSystem.statSync(filePath);

        response.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });

        const readStream = fileSystem.createReadStream(filePath);
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