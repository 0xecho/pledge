import * as childProcess from 'child_process';

interface BaseGitOptions {
  directory?: string;
}

export interface GetDiffOptions extends BaseGitOptions {
  fromBranch: string;
  toBranch: string;
}

export function getAllBranches ({ directory = undefined }: BaseGitOptions): string[] {
  const cwd = directory ? directory : childProcess.execSync('pwd').toString().split('\n').shift();
  console.debug(`in getAllBranches with cwd: ${cwd}`);
  return childProcess.execSync('git branch --all', { cwd }).toString().split('\n').map(line => line.split(' ').pop()).filter(Boolean) as string[];
}

export function getCurrentBranch ({ directory = undefined }: BaseGitOptions): string {
  const cwd = directory ? directory : childProcess.execSync('pwd').toString().split('\n').shift();
  console.debug(`in getCurrentBranch with cwd: ${cwd}`);
  return childProcess.execSync('git branch --show-current', { cwd }).toString().split('\n').shift() as string;
}

export function getDiff ({ fromBranch, toBranch, directory }: GetDiffOptions): string {
  const cwd = directory ? directory : childProcess.execSync('pwd').toString().split('\n').shift();
  const res = childProcess.execSync(`git diff ${fromBranch} ${toBranch}`, { cwd, encoding: 'utf-8' });
  return res; 
}
