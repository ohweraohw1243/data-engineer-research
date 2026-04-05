sed -i '' '/interviewState.results = {};/a\
            interviewState.reasons = {};\
' js/app.js
sed -i '' '/interviewState.results\[question.id\] = assessment.status;/a\
            if (!interviewState.reasons) interviewState.reasons = {};\
            if (assessment.reason) interviewState.reasons[question.id] = assessment.reason;\
' js/app.js
bash patch-update3.sh
rm patch-update3.sh
