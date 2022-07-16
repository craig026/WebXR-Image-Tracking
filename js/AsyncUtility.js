export async function sleepUntil(f, timeoutMs) 
{
    return new Promise((resolve, reject) => 
    {
        let timeWas = new Date();
        let wait = setInterval(function() 
        {
            if (f()) 
            {
                console.log("resolved after", new Date() - timeWas, "ms");
                clearInterval(wait);
                resolve();
            } 
            else if (new Date() - timeWas > timeoutMs) 
            { // Timeout
                console.log("rejected after", new Date() - timeWas, "ms");
                clearInterval(wait);
                reject();
            }
        }, 20);
    });
}