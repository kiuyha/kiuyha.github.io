# Portfolio Website


This is web created using AstroJS and React. You can test it in <a href="https://kiuyha.my.id" target="_blank">kiuyha.my.id</a>

## Features
- **Neobrutalist UI**. This website use neobrutalist UI.
- **Responsive**. This website is responsive for all screen size.
- **Google Spreadsheet Data**. You can use google spreadsheet as database.
- **Integrate Github Contribution**. You can show your github contribution in the website.
- **SEO Friendly**. Unlike using pure Vite, this website use AstroJS to make the HTML code to make crawels easier to index.
- **Lightweight**. The website utilize the AstroJS islands to make the website lightweight.

## Setup for your own
This tutorial will guide you how to setup this project for your own using github pages.
1. Fork this repository. <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/ForkRepository.png">

2. Rename the repository to `your-username.github.io`. This will make your site live at your root URL (`https://your-username.github.io`). I strongly recommend this for your main portfolio because the URL is short and easy to remember. Alternatively, you can give the repository a different name (e.g., `my-portfolio`), but it will be accessed at `https://your-username.github.io/my-portfolio`. This is a fine option if you plan to use a custom domain later. <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/RenameRepository.png">

2. Make a spreadsheet and add the data. You can check the format in <a href="https://docs.google.com/spreadsheets/d/1wiHW3SE8y8a6JosDY2538XPFa5Ydysw1yUb-qNMMbN4" target="_blank">here</a> and copy to your own. <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/CopySpreadsheet.png">

3. Change the `.env.example` since it will be use for the deployment. For the `VITE_SPREADSHEET_ID`, you can get it from the spreadsheet url. <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/SpreadsheetID.png">

4. You can change the static files in public folder such as favicon, banner_profile, profile_picture, loading_animation, etc.

5. Enable the github actions workflow since github by default disable it on forked repository. <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/EnableWorkflow.png">

5. Now just commit your changes, and the github action will handle the CI/CD pipeline.

6. Remember to change the source of github pages to `github actions`. <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/ChangeSourcePages.png">

7. Optional: you can change the domain from `your-username`.github.io to your custom domain. But remember you should own the domain. <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/ChangeDomain.png">

## Notes
- Ensure to format the data in spreadsheet into `plain text` format. Since it will make bug when fetch the data from the spreadsheet (because the google visualization api only support `plain text`). <img src="https://raw.githubusercontent.com/kiuyha/kiuyha.github.io/refs/heads/main/docs/EnsurePlainText.png">
- The website frame in info project only work if `X-Frame-Options` is not set to `SAMEORIGIN` or `DENY`. Also the header need to have `SameSite=None; Secure` in order to work properly.
- For using contribution you need to change `VITE_GITHUB_LINK` in `.env.example`.
- If you want to show your private repository, you need to setup api for it. Please follow this guide <a href="https://github.com/kiuyha/github-readme-stats?tab=readme-ov-file#deploy-on-your-own" target="_blank">here</a> and change the `VITE_GITHUB_API_LINK` with your host api in `.env.example`.
- You can change how many languages you want to show in the contribution section. You can change the `VITE_CONTRIBUTION_LANGS_COUNT` in `.env.example`.
- If you want to include all commits in the contribution section instead from this year, you can change the `VITE_CONTRIBUTION_INCLUDE_ALL_COMMITS` in `.env.example`.

## License
This project is released under the [MIT License](https://github.com/kiuyha/kiuyha.github.io/blob/main/LICENSE).

## END
Thank you for reading. Feel free to fork this project and modify it. If this repository benefits you please give a star. The design heavily inspired by <a href="https://reiiv.is-a.dev" target="_blank">ReiivanTheOnlyOne</a>. The api for contribution is <a href="https://github.com/kiuyha/github-readme-stats" target="_blank">here</a> forked from <a href="https://github.com/anuraghazra/github-readme-stats" target="_blank">anuraghazra/github-readme-stats</a>.