let input='';for await(const chunk of process.stdin)input+=chunk;
const {program}=JSON.parse(input);
process.stdout.write(JSON.stringify({id:program.id,url:program.url,status:'页面已读取',checkedAt:new Date().toISOString(),message:'Fixture response'}));
