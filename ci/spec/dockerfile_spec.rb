require 'dockerspec/serverspec'
require 'dockerspec/infrataster'

RSpec.describe 'Dockerfile' do
  describe docker_build('.') do
    it { should have_entrypoint ['/entrypoint.sh'] }
    it { should have_expose 80 }

    describe docker_run(described_image) do
      describe file('/etc/nginx/conf.d/default.conf') do
        it { should be_file }
        it { should contain 'server_name  localhost;' }
      end

      describe server(described_container) do # Infrataster
        describe http('/akamai/akamai-sureroute-test-object.html') do
          it 'responds content including "Lorem Ipsum"' do
            expect(response.body).to include 'Lorem Ipsum'
          end

          it 'responds as "nginx" server' do
            expect(response.headers['server']).to match(/nginx/i)
          end
        end
      end
    end
  end
end
