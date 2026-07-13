import "./Candidate.css";

function Referrals(){

    return(

        <div className="candidate-page">

            <h2>Referral Candidates</h2>

            <table>

                <thead>

                <tr>

                    <th>Name</th>

                    <th>Referred By</th>

                    <th>Role</th>

                    <th>Status</th>

                </tr>

                </thead>

                <tbody>

                <tr>

                    <td>Priya</td>

                    <td>John</td>

                    <td>Software Engineer</td>

                    <td>Pending</td>

                </tr>

                </tbody>

            </table>

        </div>

    );

}

export default Referrals;