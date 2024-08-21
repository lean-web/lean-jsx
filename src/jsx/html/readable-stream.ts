// const s = () => new ReadableStream<string>({
//   interval = undefined;

//   start(controller) {
//     this.#interval = setInterval(() => {
//       const string = new Date().toLocaleTimeString();
//       // Add the string to the stream.
//       controller.enqueue(string);
//       console.log(`Enqueued ${string}`);
//     }, 1_000);

//     setTimeout(() => {
//       clearInterval(this.#interval);
//       // Close the stream after 10s.
//       controller.close();
//     }, 10_000);
//   },

//   cancel() {
//     // This is called if the reader cancels.
//     clearInterval(this.#interval);
//   }
// }, {
//     highWaterMark: 10,
//     size(chunk) {
//       return chunk.length;
//     },
//   },)
