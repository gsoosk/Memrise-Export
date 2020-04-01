// ==UserScript==
// @name         DownloadCourse
// @namespace    http://github.com/gsoosk
// @version      1.0
// @description  export memrise as csv/markdown
// @author       gsoosk
// @match        https://www.memrise.com/course/*/*/
// @updateURL    https://github.com/gsoosk/Memrise-Export/memriseExport.js
// @downloadURL  https://github.com/gsoosk/Memrise-Export/memriseExport.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const returnMarkdown = false;
    


    function getWords(courseId, level) {
        const url = `https://www.memrise.com/ajax/session/?course_id=${courseId}&level_index=${level}&session_slug=preview`
        console.log('Fetching words from ' + url)
        return fetch(url, { credentials: 'same-origin' })
        // parse response
            .then(res => {
            return res.status === 200
                ? res.json()
            // map results
                .then(data => {
                return data.learnables.map(row => ({
                    original: row.item.value,
                    translation: row.definition.value,
                    extraInfo: row.confused_answers
                }))
            })
                .then(words => {
                return getWords(courseId, level + 1)
                    .then(words.concat.bind(words))
            })
            : []
        })
            .catch(err => {
            console.error(err)
            return []
        })
    }
    function getMarkdown(word) {
        let wordMarkdown = ''
        wordMarkdown += '# ' + word.original + '\n';
        wordMarkdown += '### Definition \n' + word.translation + '\n\n' ;
        wordMarkdown += word.extraInfo.length!==0 ? word.extraInfo.map(extra => '### ' + extra.label + ' \n' + extra.value + '\n\n' ).join('') : '';
        wordMarkdown += '--- \n\n';
        return wordMarkdown
    }
    function getCsvHeader(words) {
        return 'Word,Definition' + (words[0].extraInfo.length!==0 ? ',' + words[0].extraInfo.map(extra => '"' + extra.label + '"' ).join(',') : '');
    }
    function getCsvRow(word) {
        let wordRow = '"' + word.original + '","' + word.translation + '"' + (word.extraInfo.length!==0 ? ',' + word.extraInfo.map(extra => '"' + extra.value + '"').join(',') : '');
        return wordRow
    }
     // fetch
    const start = 1
    const courseId = location.href.match(/\d+/)[0];
    getWords(courseId, start)
    // format as csv
        .then(words => {
        console.log(words.length + ' words')
        return returnMarkdown ? words.map(word => getMarkdown(word)).join('') : (getCsvHeader(words) + '\n' + words.map(word => getCsvRow(word)).join('\n'));
    })
    // print
    .then(console.log)
})();