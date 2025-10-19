module.exports = {
  rules: {
    'require-description': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require ESLint disable directives to include an explanatory description.',
        },
        schema: [],
        messages: {
          missingDescription: 'Include a description after the ESLint disable directive using "-- reason".',
        },
      },
      create(context) {
        return {
          Program() {
            const sourceCode = context.sourceCode ?? context.getSourceCode();
            const comments = sourceCode.getAllComments();

            for (const comment of comments) {
              const value = comment.value.trim();

              if (!/^eslint-disable/.test(value)) {
                continue;
              }

              if (!/--\s*\S/.test(value)) {
                context.report({
                  loc: comment.loc,
                  messageId: 'missingDescription',
                });
              }
            }
          },
        };
      },
    },
  },
};
