const QUEUE_KEY = 'offline_submissions';

export const saveToQueue = (submission) => {
  const queue = getQueue();
  const submissionWithId = {
    ...submission,
    tempId: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  queue.push(submissionWithId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return submissionWithId;
};

export const getQueue = () => {
  const queue = localStorage.getItem(QUEUE_KEY);
  return queue ? JSON.parse(queue) : [];
};

export const removeFromQueue = (tempId) => {
  const queue = getQueue();
  const updatedQueue = queue.filter(item => item.tempId !== tempId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
};

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};
