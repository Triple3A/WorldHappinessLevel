# More about the Framework


This is a framework to map the happiness level of different countries to help immigrants, especially families with children, choose their destination.


## Files You Have to Care about

`package.json` is where we manage the libraries we installed. Besides this, most of the files you can ignore, but **the files under `./src/` are your concern**.

* `./data/` is where we manage to store the data.

* `./src/main.tsx` is the root script file for React that instatinates our single page application.
* `./src/App.tsx` is the root file for all **development** needs and is also where we manage the layout and load in components.
* `./src/types.ts` is usually where we declare our customized types if you're planning to use it.

* `./src/components/` is where we create the components. You may have multiple components depends on your design.
  
## How to run:
 * To run the application, first you need to install run the `npm install`. Then, you should run the `npm run dev`.
