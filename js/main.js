function translate(lang) {
    // placeholder: burada ileride metinleri çeviri objesi ile değiştirebilirsin
    const hobbies = document.getElementById("hobbies");
    if(lang === 'en') {
        hobbies.querySelector('h2').innerText = "Hobbies";
    } else if(lang === 'it') {
        hobbies.querySelector('h2').innerText = "Hobby";
    } else if(lang === 'tr') {
        hobbies.querySelector('h2').innerText = "Hobiler";
    }
    alert("Translation function placeholder. You can expand this.");
}
