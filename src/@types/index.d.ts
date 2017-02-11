// TODO: make like in vile's .d.ts
declare namespace rubycritic {
  export interface Config {
    rating? : string;
  }

  export interface JSON {
    analysed_modules? : IssuesByFile;
  }

  export interface Issue {
    path : string;
    churn? : number;
    complexity? : number;
    rating? : string;
    smells? : Smell[];
  }

  export type IssuesByFile = Issue[];

  export interface Smell {
    type? : string;
    context : string;
    message : string;
    locations : Loc[];
  }

  export interface Loc {
    path : string;
    line? : string;
  }
}
