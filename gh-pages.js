import ghpages from 'gh-pages';

ghpages.publish(
    'build', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/rveciana/rveciana.github.io', // Update to point to your repository  
        user: {
            name: 'rveciana', // update to use your name
            email: 'rveciana@gmail.com' // Update to use your email
        },
        src: ['**/*', '.nojekyll']
    },
    () => {
        console.log('Deploy Complete!')
    }
)