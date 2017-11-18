module.exports = (function() {
  const _steps = [];
  
  function AddStep(name, step) {
    _steps.push({
      name,
      start: () => new Promise((resolve, reject) => {
        let maybe = (err) => {
          if(err) { 
            reject(err);
          } else {
            resolve();
          }
        };
        step(resolve, reject, maybe)
      })
    });
  }

  function _executeRemainingSteps() {
    let step = _steps.shift();
    if(step) {
      const paddingWidth = 40;
      const name = (step.name + Array(paddingWidth).join('.')).substr(0, paddingWidth);
      process.stdout.write(name);
      let log = (message) => {
        process.stdout.write(message);
      }
      log('Starting...');
      const timeoutDuration = 5000;
      let timeout = setTimeout(() => log('Timeout'), timeoutDuration);
      step.start().then(() => {
        clearTimeout(timeout);
        log('Done.\n');
        _executeRemainingSteps();
      }).catch((err) => {
        clearTimeout(timeout);
        log('Aborted.')
        log(`\n\n${err}\n\n`);
      });
    }
  }

  function ExecuteSteps() {
    _executeRemainingSteps();
  }

  return {
    AddStep,
    ExecuteSteps
  }
}());
