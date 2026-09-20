fetch('https://share.google/k8aE75VgEgJd2w028', { redirect: 'manual' })
  .then(res => {
    console.log(res.status);
    console.log(res.headers.get('location'));
  })
